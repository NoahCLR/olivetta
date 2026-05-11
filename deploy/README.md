# Deploy with Portainer and Cloudflare Tunnel

This site is static HTML/CSS/JS, so the container only needs Nginx.

## Portainer Git stack

In Portainer, create a new stack from Git:

- Environment: your Ubuntu Docker environment
- Stack name: `casa-dei-cigni`
- Build method: Git repository
- Repository URL: your Git repository URL
- Repository reference: the branch you deploy from, for example `main`
- Compose path: `deploy/docker-compose.yml`

If the repository is private, add Git credentials in Portainer. For GitHub, use your username and a personal access token with read access to the repository.

The stack uses the existing external Docker network:

```yaml
networks:
  ncleroy-net:
    external: true
```

Your existing Cloudflare tunnel container is already expected to be attached to that network:

```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared-ncleroy-net
```

Deploy the stack. Portainer will clone the repo, build the Nginx image, and start the site container as `casa-dei-cigni-site`.

## Cloudflare Tunnel target

In Cloudflare Zero Trust, set the public hostname service to:

```text
http://casa-dei-cigni-site:80
```

If you configure `cloudflared` with YAML, the ingress entry looks like this:

```yaml
ingress:
  - hostname: your-domain.example
    service: http://casa-dei-cigni-site:80
  - service: http_status:404
```

Because both containers are on `ncleroy-net`, the tunnel can resolve the site by container name.

## If cloudflared is not on the same Docker network

Attach the tunnel container to the network:

```sh
docker network connect ncleroy-net cloudflared-ncleroy-net
```

If you cannot use a shared Docker network, uncomment the `ports` section in `docker-compose.yml`:

```yaml
ports:
  - "8088:80"
```

Then point the tunnel to:

```text
http://127.0.0.1:8088
```

If `cloudflared` runs on another machine/container, use the NAS LAN address instead:

```text
http://<nas-lan-ip>:8088
```

## Updating the site

After pushing changes to Git, open the stack in Portainer and use Pull and redeploy to fetch the latest commit and rebuild the site.

If your Portainer install has GitOps/automatic updates available, enable it on the stack to let Portainer periodically check the Git repository and redeploy when the commit changes.

If you update manually on the NAS instead, run:

```sh
cd casa-dei-cigni
git pull --ff-only
docker compose -f deploy/docker-compose.yml up -d --build
```

For automatic updates, enable Portainer's Git/webhook redeploy option if available in your Portainer setup.

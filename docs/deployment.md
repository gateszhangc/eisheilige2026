# Eisheilige2026 Deployment

## Mapping
- GitHub repository: `gateszhangc/eisheilige2026`
- Git branch: `main`
- Dokploy project: `none`
- Image repository: `registry.144.91.77.245.sslip.io/eisheilige2026`
- K8s manifest path: `deploy/k8s/overlays/prod`
- Argo CD application: `eisheilige2026`
- K8s namespace: `eisheilige2026`
- Primary domain: `eisheilige2026.lol`

发布链路：

`gateszhangc/eisheilige2026 -> main -> build-jobs Kaniko Job -> registry.144.91.77.245.sslip.io/eisheilige2026:<git-sha> -> deploy/k8s/overlays/prod/kustomization.yaml newTag -> Argo CD 自动同步`

## What The Workflow Does
1. GitHub Actions 先运行 `npm ci`、安装 Playwright Chromium，并执行 `npm test`。
2. 通过 `KUBE_CONFIG_DATA` 连接集群，在 `build-jobs` namespace 创建 `eisheilige2026-build-git-auth`。
3. Workflow 渲染 `deploy/build-job.yaml`，触发集群内 Kaniko Job 构建镜像。
4. 构建成功后，Workflow 自动把 `deploy/k8s/overlays/prod/kustomization.yaml` 中的 `newTag` 更新为当前 `git sha`，并推回 `main`。
5. Argo CD 应用 `eisheilige2026` 监听同仓库 `deploy/k8s/overlays/prod`，检测到提交后自动同步。

## Required GitHub Secret
- `KUBE_CONFIG_DATA`: 本机 `~/.kube/config` 的 base64 内容。

## Cluster Prerequisites
- `build-jobs/registry-push` 需要存在，供 Kaniko 推送镜像。
- 业务 namespace 需要有镜像拉取 secret `dokploy-fleet-ghcr`。
- 业务 namespace 需要有 `cloudflare-api-token`，key 为 `api-token`，供 cert-manager 申请证书。

## First-Time Bootstrap
1. 创建并推送仓库到 `gateszhangc/eisheilige2026`。
2. 设置 GitHub secret `KUBE_CONFIG_DATA`。
3. 创建 namespace `eisheilige2026`，并复制：
   - `graphify/dokploy-fleet-ghcr -> eisheilige2026/dokploy-fleet-ghcr`
   - `graphify/cloudflare-api-token -> eisheilige2026/cloudflare-api-token`
4. 应用 Argo CD Application：
   - `kubectl apply -f deploy/argocd/application.yaml`
5. 推送到 `main` 或手动触发 `Build And Release`。

## DNS And GSC
- Cloudflare 负责 `eisheilige2026.lol` 与 `www.eisheilige2026.lol`。
- 站点上线后，使用 `webapp-launch-analytics` 中的：
  - `ensure-cloudflare-dns.sh`
  - `setup-gsc.sh`
  - `check-gsc-property.sh`
- 本项目只接入 GSC，不接入 GA4/Clarity。

## Verification
- `npm test`
- `kubectl get application -n argocd eisheilige2026`
- `curl -I https://eisheilige2026.lol/`
- `curl https://eisheilige2026.lol/robots.txt`
- `curl https://eisheilige2026.lol/sitemap.xml`
- `check-gsc-property.sh eisheilige2026.lol`

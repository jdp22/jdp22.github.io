# Dapeng Jiang — personal homepage

蓝色调的个人学术主页，包含研究介绍、个人兴趣图和交互式 Conway's Game of Life。
网站是纯静态 HTML / CSS / JavaScript，无需安装依赖或构建。

## 用 GitHub 管理内容

这个仓库是网站内容的主要来源。修改文件并提交到 `main` 后，GitHub Actions
会自动把 `dist/` 发布到 GitHub Pages；发布进度可以在仓库的 **Actions** 页面查看。

| 要更新的内容 | 文件 |
| --- | --- |
| 个人简介、链接、最新动态 | `dist/index.html` |
| 论文、研究经历 | `dist/research.html` |
| 研究经历中的机构标志 | `dist/assets/logos/` |
| 博客与笔记 | `dist/blog.html` |
| 兴趣图的文字和互动 | `dist/assets/curiosity-map.mjs` |
| 配色、字体和页面布局 | `dist/assets/site.css` |

可以直接在 GitHub 打开文件，点击铅笔按钮编辑，再选择 **Commit changes**。
也可以在本地修改后 `git push`，或通过 pull request 合并到 `main`。
新增博客文章时，在 `dist/` 新建 HTML 文件，并从 `blog.html` 链接到它。
站内链接和资源路径使用相对路径，以兼容 GitHub Pages 的项目子目录。

## 启用 GitHub Pages

1. 打开仓库的 **Settings → Pages**。
2. 在 **Build and deployment → Source** 选择 **GitHub Actions**。
3. 合并发布配置到 `main`，或在 Actions 中手动运行 **Deploy homepage to GitHub Pages**。

启用后的默认网站地址为：
https://jdp22.github.io/

如果以后更换仓库名或绑定自己的域名，请同步修改三个 HTML 页面的 canonical 地址。

## 本地查看

在仓库根目录运行：

```sh
python3 -m http.server 8000 --directory dist
```

打开 http://localhost:8000。字体和插图都已包含在仓库中。
字体 DM Sans 和 Caveat 使用 SIL Open Font License，许可证位于 `dist/assets/fonts/`。

机构标志保留官方颜色与比例，文件存放在仓库中，页面无需从外部加载图片。
标志来源：[ByteDance 标志](https://commons.wikimedia.org/wiki/File:ByteDance_logo_English.svg)、
[Tencent 媒体资源](https://www.tencent.com/newsroom/media-resources/)、
[UW 品牌资源](https://www.washington.edu/brand/brand-elements/logos/)、
[UCLA Design System](https://designsystem.brand.ucla.edu/build/v2.7.0/docs/header-and-navigation/box-logo-header.html)、
[Illinois Web Resources](https://web.brand.illinois.edu/logos/)。

## 发布内容

发布流程仅上传 `dist/`。README、工作流配置和其他仓库文件不会作为网页发布。
Game of Life 代码位于 `dist/assets/site.mjs` 和 `dist/assets/life-engine.mjs`。
之后的正式网站更新以 GitHub 为准。

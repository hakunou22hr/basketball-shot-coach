# Basketball Shot Coach

iPhone/iPad上でシュート動画を約12fpsで連続解析し、6フェーズと成功フォームの差を確認するPWAです。動画はアップロードせず、時系列の解析値・結果・成功基準を`localStorage`へ保存します。

## MediaPipeアセットとGitHub Pages

ブラウザが使うパスは次のとおりです。すべて`document.baseURI`相対なので、GitHub Pagesの`/basketball-shot-coach/`でも同一オリジンから読み込まれます。

- JSランタイム: `mediapipe/vision_bundle.mjs`（アプリが実際にimportするESモジュール）
- WASM: `wasm/`
- Pose Landmarker Liteモデル: `models/pose_landmarker_lite.task`

リポジトリでは`@mediapipe/tasks-vision`を固定バージョンのnpm依存関係として管理します。`.github/workflows/deploy-pages.yml`は、GitHub Actions上で次の処理を実行します。

1. npmから公式`@mediapipe/tasks-vision`パッケージをインストールする。
2. `npm run prepare:mediapipe`で公式JSランタイムとWASMを上記ディレクトリへコピーする。
3. Googleの公式MediaPipe ModelsバケットからPose Landmarker Liteモデルをビルド時に取得する。
4. 各バイナリの実サイズを検証し、`dist/`へPages成果物を作る。
5. テスト後にPagesへデプロイし、公開された全AIファイルがHTTP 200を返すことを確認する。

実行時にCDNやGoogle Storageへアクセスするコードはありません。モデル取得はGitHub Actionsのビルド時だけです。Actionsが成功したPages成果物にはランタイム、WASM、モデルがすべて含まれるため、Service Workerの初回インストール完了後は完全オフラインで起動・解析できる設計です。

## ローカルでの準備

```bash
npm install
mkdir -p models
curl --fail --location \
  https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task \
  --output models/pose_landmarker_lite.task
npm run prepare:mediapipe
npm run build
npm test
npm start -- --directory dist
```

このリポジトリの作業環境でネットワーク取得できない場合、空ファイルやダミーを置いてはいけません。GitHub Actionsの`Build and deploy GitHub Pages`を手動実行してください。

## オフライン準備確認

PWA、Service Worker、カメラにはHTTPS（localhostは例外）が必要です。画面の「オフライン使用準備」は、HTML、JS、CSS、アイコン、MediaPipeランタイム、全WASM、モデルを実際に`fetch`し、HTTP成功と最小ファイルサイズの両方を検査します。不足、0 byte、HTMLエラーページ、極端に小さいプレースホルダーがある場合は解析を開始しません。

## 解析データ

各フレームについて時刻、左右膝角度、シュート側肘角度、上体傾斜、肩幅で正規化した足幅・左右足前後差・腰高・肩高、ランドマーク信頼度を保持します。「構え」「沈み込み」「上昇」「リリース付近」「フォロースルー」「着地」へ対応付け、リリースは手動修正できます。成功フォームとの比較は同名フェーズに最も近い解析フレーム同士で行います。

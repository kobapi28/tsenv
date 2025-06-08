# tsenv

TypeScriptスキーマに対して環境変数の型チェックを行います。

[English README](./README.md)

## インストール

```bash
npm install -D tsenv
# または
pnpm add -D tsenv
# または
yarn add -D tsenv
```

## 使用方法

### 1. 環境変数の型を定義する

環境変数スキーマをエクスポートするTypeScriptファイルを作成します：

```typescript
// env.ts
type Env = {
    API_URL: string
    ASSET_URL: string
    PORT?: number
    DEBUG?: boolean
}

export default Env
```

### 2. 設定ファイルを作成する

プロジェクトルートに`tsenv.config.js`を作成します：

```javascript
// tsenv.config.js
module.exports = {
    schema: './env.ts',      // 型定義ファイルへのパス
    files: ['./env/**']      // チェック対象のenvファイルのglobパターン
}
```

tsx/ts-nodeでTypeScriptを使用している場合：

```typescript
// tsenv.config.ts
export default {
    schema: './env.ts',
    files: ['./env/**']
}
```

### 3. 型チェッカーを実行する

```bash
npx tsenv check
```

カスタム設定ファイルを指定することもできます：

```bash
npx tsenv check -c ./custom-config.ts
```

## 機能

- ✅ `string`、`number`、`boolean`型の型チェック
- ✅ オプション属性のサポート（`?`を使用）
- ✅ globパターンを使用した複数のenvファイルのサポート
- ✅ ファイル位置を含む明確なエラーレポート
- ✅ 必須変数の欠落検出
- ✅ 未定義変数の検出

## 例

完全な動作例については[example](./example)ディレクトリを参照してください。

## エラーの種類

### 必須変数の欠落
スキーマで必須として定義されているが、どのenvファイルにも見つからない変数。

### 型の不一致
期待される型と一致しない値を持つ変数。

### 未定義変数
envファイル内に存在するが、スキーマで定義されていない変数。

## ライセンス

MIT
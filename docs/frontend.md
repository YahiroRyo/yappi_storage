# フロントエンド設計

## 概要

Next.js 15.1.5とReact 19を使用したモダンなフロントエンドアプリケーション。TypeScriptによる型安全性とStorybookによるコンポーネント開発を特徴としています。

## 技術スタック

### コア技術
- **Next.js**: 15.1.5 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.x
- **Sass**: スタイリング

### 開発ツール
- **Storybook**: コンポーネント開発
- **ESLint**: コード品質
- **Prettier**: フォーマット

### 外部ライブラリ
- **axios**: HTTP通信
- **lucide-react**: アイコン
- **file-saver**: ファイル保存
- **react-pdf**: PDF表示
- **video.js**: 動画再生

## ディレクトリ構造

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # ルートページ（/drive/rootにリダイレクト）
│   │   ├── template.tsx       # 共通テンプレート
│   │   ├── globals.scss       # グローバルスタイル
│   │   └── drive/             # ドライブ機能
│   │       └── [...ids]/      # 動的ルーティング
│   ├── components/             # 再利用可能コンポーネント
│   │   ├── ui/                # 基本UIコンポーネント
│   │   │   ├── button/        # ボタンコンポーネント
│   │   │   ├── grid/          # グリッドレイアウト
│   │   │   ├── text/          # テキストコンポーネント
│   │   │   └── alert/         # アラートコンポーネント
│   │   └── fileControl/       # ファイル操作専用
│   │       └── createDirectoryModal/ # ディレクトリ作成モーダル
│   └── api/                   # API通信ロジック
│       └── users/             # ユーザー関連API
├── public/                    # 静的ファイル
├── .storybook/               # Storybook設定
├── package.json              # 依存関係
├── tsconfig.json             # TypeScript設定
├── next.config.ts            # Next.js設定
└── .eslintrc.json           # ESLint設定
```

## アーキテクチャパターン

### コンポーネント設計

#### 1. Atomic Design
```
Atoms (ui/) → Molecules → Organisms → Templates → Pages
```

#### 2. 関数コンポーネント
```typescript
export function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button 
      className={`button button--${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
}
```

### 状態管理

#### React State & Context
```typescript
// ユーザー状態管理例
const [user, setUser] = useState<User | null>(null);

useEffect(() => {
  (async () => {
    const response = await getLoggedInUser();
    setUser(response.user);
  })();
}, []);
```

### ルーティング (App Router)

#### 動的ルート
```typescript
// app/drive/[...ids]/page.tsx
export default function DrivePage({ params }: { params: { ids: string[] } }) {
  const currentPath = params.ids || [];
  return <DriveInterface currentPath={currentPath} />;
}
```

## 主要コンポーネント

### 1. UI コンポーネント

#### Button
```typescript
// components/ui/button/index.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

export function Button({ children, onClick, variant, disabled }: ButtonProps) {
  return (
    <button 
      className={`button button--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

#### Grid Layout
```typescript
// components/ui/grid/gridHorizonRow.tsx
interface GridHorizonRowProps {
  children: React.ReactNode;
  gap?: string;
  gridTemplateColumns?: string;
  backgroundColor?: string;
}

export function GridHorizonRow({ 
  children, 
  gap = "1rem", 
  gridTemplateColumns = "1fr",
  backgroundColor 
}: GridHorizonRowProps) {
  return (
    <div 
      style={{
        display: "grid",
        gridTemplateColumns,
        gap,
        backgroundColor
      }}
    >
      {children}
    </div>
  );
}
```

### 2. ファイル操作コンポーネント

#### ディレクトリ作成モーダル
```typescript
// components/fileControl/createDirectoryModal/index.tsx
interface CreateDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  parentDirectoryId?: string;
}

export function CreateDirectoryModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  parentDirectoryId 
}: CreateDirectoryModalProps) {
  const [directoryName, setDirectoryName] = useState("");

  const handleSubmit = () => {
    if (directoryName.trim()) {
      onSubmit(directoryName.trim());
      setDirectoryName("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>新しいディレクトリを作成</h2>
        <input 
          type="text"
          value={directoryName}
          onChange={(e) => setDirectoryName(e.target.value)}
          placeholder="ディレクトリ名"
        />
        <div className="modal-actions">
          <Button onClick={onClose} variant="secondary">
            キャンセル
          </Button>
          <Button onClick={handleSubmit} variant="primary">
            作成
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## API通信

### HTTP Client
```typescript
// api/users/getLoggedInUser.ts
import axios from 'axios';

export interface Response {
  user?: User;
  error?: string;
}

export async function getLoggedInUser(): Promise<Response> {
  try {
    const response = await axios.get('/api/users', {
      withCredentials: true
    });
    return { user: response.data };
  } catch (error) {
    return { error: 'Failed to get user information' };
  }
}
```

### WebSocket通信
```typescript
// WebSocketファイルアップロード例
class FileUploader {
  private ws: WebSocket;

  constructor() {
    this.ws = new WebSocket('ws://localhost:8000/ws');
  }

  async uploadFile(file: File) {
    // ファイル名初期化
    this.sendMessage({
      event: "initialize_file_name",
      data: { filename: file.name }
    });

    // チャンク分割してアップロード
    const chunkSize = 64 * 1024; // 64KB
    for (let offset = 0; offset < file.size; offset += chunkSize) {
      const chunk = file.slice(offset, offset + chunkSize);
      const arrayBuffer = await chunk.arrayBuffer();
      
      this.sendMessage({
        event: "upload_file_chunk",
        data: {
          checksum: this.calculateChecksum(arrayBuffer),
          chunk: Array.from(new Uint8Array(arrayBuffer))
        }
      });
    }

    // アップロード完了通知
    this.sendMessage({
      event: "finished_upload",
      data: null
    });
  }

  private sendMessage(message: any) {
    this.ws.send(this.encodeBinary(message));
  }
}
```

## スタイリング

### Sass/SCSS
```scss
// globals.scss
$primary-color: #007bff;
$secondary-color: #6c757d;
$success-color: #28a745;
$danger-color: #dc3545;

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &--primary {
    background-color: $primary-color;
    color: white;

    &:hover {
      background-color: darken($primary-color, 10%);
    }
  }

  &--secondary {
    background-color: $secondary-color;
    color: white;
  }

  &--danger {
    background-color: $danger-color;
    color: white;
  }
}
```

### CSS Modules
```scss
// components/fileControl/index.module.scss
.fileControlContainer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actionButton {
  @extend .button;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
```

## 状態管理パターン

### ローカル状態
```typescript
function FileList() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async (directoryId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getFiles(directoryId);
      setFiles(response.files);
    } catch (err) {
      setError('ファイルの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div>
      {loading && <div>読み込み中...</div>}
      {error && <div className="error">{error}</div>}
      {files.map(file => (
        <FileItem key={file.id} file={file} />
      ))}
    </div>
  );
}
```

### Context API
```typescript
// contexts/UserContext.tsx
interface UserContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    const response = await loginUser(username, password);
    if (response.user) {
      setUser(response.user);
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
```

## パフォーマンス最適化

### コード分割
```typescript
// 動的インポート
const PdfViewer = dynamic(() => import('./PdfViewer'), {
  loading: () => <div>PDFビューアーを読み込み中...</div>,
  ssr: false
});

// ページレベル分割
export default function DrivePage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <DriveInterface />
    </Suspense>
  );
}
```

### メモ化
```typescript
// React.memo
export const FileItem = React.memo<FileItemProps>(({ file, onSelect }) => {
  return (
    <div onClick={() => onSelect(file.id)}>
      {file.name}
    </div>
  );
});

// useMemo
function FileList({ files }: { files: File[] }) {
  const sortedFiles = useMemo(() => {
    return files.sort((a, b) => a.name.localeCompare(b.name));
  }, [files]);

  return (
    <div>
      {sortedFiles.map(file => (
        <FileItem key={file.id} file={file} />
      ))}
    </div>
  );
}
```

## テスト戦略

### Storybook
```typescript
// Button.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
```

### ユニットテスト
```typescript
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## セキュリティ

### XSS対策
```typescript
// サニタイズされたHTML表示
import DOMPurify from 'dompurify';

function SafeHtml({ html }: { html: string }) {
  const sanitizedHtml = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
```

### CSRF対策
```typescript
// APIリクエストにCSRFトークン付与
axios.defaults.withCredentials = true;
axios.interceptors.request.use((config) => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (token) {
    config.headers['X-CSRF-TOKEN'] = token;
  }
  return config;
});
```

## デプロイメント

### ビルド最適化
```javascript
// next.config.ts
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };
    return config;
  },
};

export default nextConfig;
```

### 静的最適化
```typescript
// 静的生成の設定
export async function generateStaticParams() {
  return [
    { ids: [] }, // ルートパス
    { ids: ['documents'] }, // /drive/documents
  ];
}
``` 
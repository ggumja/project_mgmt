# Shadcn UI 사용 가이드
## 기능정의서 & 요구사항정의서 관리 시스템

---

## 📌 Shadcn UI란?

Shadcn UI는 **복사-붙여넣기** 방식의 컴포넌트 라이브러리입니다. npm 패키지가 아닌, 프로젝트에 직접 컴포넌트 코드를 추가하는 방식으로 작동합니다.

### 주요 특징
- ✅ **완전한 커스터마이징** - 코드를 직접 소유하므로 자유롭게 수정 가능
- ✅ **접근성 우선** - Radix UI 기반으로 WCAG 준수
- ✅ **TailwindCSS** - 일관된 디자인 시스템
- ✅ **TypeScript** - 완벽한 타입 지원
- ✅ **다크모드** - 내장 다크모드 지원

---

## 🚀 초기 설정

### 1. Shadcn UI 초기화

```bash
npx shadcn@latest init
```

**설정 옵션**:
```
✔ Would you like to use TypeScript? … yes
✔ Which style would you like to use? › New York
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? … src/index.css
✔ Would you like to use CSS variables for colors? … yes
✔ Where is your tailwind.config.js located? … tailwind.config.js
✔ Configure the import alias for components: … @/components
✔ Configure the import alias for utils: … @/lib/utils
✔ Are you using React Server Components? … no
```

### 2. 생성되는 파일들

```
src/
├── components/
│   └── ui/              # Shadcn UI 컴포넌트가 여기에 추가됨
├── lib/
│   └── utils.ts         # cn() 유틸리티 함수
└── index.css            # Tailwind 설정 및 CSS 변수
```

---

## 📦 필수 컴포넌트 설치

### 프로젝트에 필요한 컴포넌트

```bash
# 기본 컴포넌트
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group

# 폼 관련
npx shadcn@latest add form

# 레이아웃
npx shadcn@latest add card
npx shadcn@latest add separator
npx shadcn@latest add tabs
npx shadcn@latest add accordion

# 데이터 표시
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add avatar

# 오버레이
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add popover
npx shadcn@latest add sheet
npx shadcn@latest add toast

# 네비게이션
npx shadcn@latest add navigation-menu
npx shadcn@latest add breadcrumb

# 피드백
npx shadcn@latest add alert
npx shadcn@latest add progress
npx shadcn@latest add skeleton

# 기타
npx shadcn@latest add calendar
npx shadcn@latest add command
npx shadcn@latest add tooltip
```

---

## 🎨 테마 설정

### CSS 변수 (src/index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
```

### 다크모드 토글 구현

```typescript
// src/components/theme-toggle.tsx
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

---

## 💡 주요 컴포넌트 사용 예제

### 1. Button

```tsx
import { Button } from "@/components/ui/button"

<Button variant="default">기본 버튼</Button>
<Button variant="destructive">삭제</Button>
<Button variant="outline">외곽선</Button>
<Button variant="ghost">고스트</Button>
<Button size="sm">작은 버튼</Button>
<Button size="lg">큰 버튼</Button>
```

### 2. Form (React Hook Form 통합)

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  title: z.string().min(2, "제목은 최소 2자 이상이어야 합니다."),
  description: z.string().optional(),
})

export function SpecForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="기능 제목을 입력하세요" {...field} />
              </FormControl>
              <FormDescription>
                기능정의서의 제목입니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">저장</Button>
      </form>
    </Form>
  )
}
```

### 3. Table

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function SpecTable({ specs }) {
  return (
    <Table>
      <TableCaption>기능정의서 목록</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>제목</TableHead>
          <TableHead>카테고리</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>작성일</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {specs.map((spec) => (
          <TableRow key={spec.id}>
            <TableCell className="font-medium">{spec.title}</TableCell>
            <TableCell>{spec.category}</TableCell>
            <TableCell>
              <Badge variant={spec.status === 'approved' ? 'success' : 'default'}>
                {spec.status}
              </Badge>
            </TableCell>
            <TableCell>{spec.created_at}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### 4. Dialog (모달)

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function CreateSpecDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>새 기능정의서</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>기능정의서 작성</DialogTitle>
          <DialogDescription>
            새로운 기능정의서를 작성합니다.
          </DialogDescription>
        </DialogHeader>
        {/* Form 컴포넌트 */}
      </DialogContent>
    </Dialog>
  )
}
```

### 5. Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ProjectCard({ project }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>진행 중인 기능: {project.spec_count}개</p>
      </CardContent>
      <CardFooter>
        <Button>상세 보기</Button>
      </CardFooter>
    </Card>
  )
}
```

### 6. Toast (알림)

```tsx
// src/hooks/use-toast.ts (Shadcn이 자동 생성)
import { useToast } from "@/hooks/use-toast"

export function SaveButton() {
  const { toast } = useToast()

  const handleSave = () => {
    // 저장 로직
    toast({
      title: "저장 완료",
      description: "기능정의서가 성공적으로 저장되었습니다.",
    })
  }

  return <Button onClick={handleSave}>저장</Button>
}

// App.tsx에 Toaster 추가
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <>
      {/* 앱 컨텐츠 */}
      <Toaster />
    </>
  )
}
```

---

## 🎯 프로젝트 적용 예시

### 기능정의서 목록 페이지

```tsx
// src/pages/specs/SpecListPage.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"

export function SpecListPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>기능정의서 목록</CardTitle>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 기능정의서
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>우선순위</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>작성자</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 데이터 매핑 */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 📚 참고 자료

- **공식 문서**: https://ui.shadcn.com
- **컴포넌트 목록**: https://ui.shadcn.com/docs/components
- **테마 커스터마이징**: https://ui.shadcn.com/themes
- **예제**: https://ui.shadcn.com/examples

---

## 🔧 커스터마이징 팁

### 1. 컴포넌트 수정
Shadcn UI 컴포넌트는 `src/components/ui/` 폴더에 있으므로 직접 수정 가능합니다.

### 2. 새로운 Variant 추가
```tsx
// src/components/ui/button.tsx
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "...",
        destructive: "...",
        // 커스텀 variant 추가
        success: "bg-green-500 text-white hover:bg-green-600",
      },
    },
  }
)
```

### 3. 색상 테마 변경
`src/index.css`의 CSS 변수를 수정하여 전체 테마 색상 변경 가능합니다.

---

## ✅ 체크리스트

- [ ] Shadcn UI 초기화 완료
- [ ] 필수 컴포넌트 설치
- [ ] 다크모드 토글 구현
- [ ] 테마 색상 커스터마이징
- [ ] Form 컴포넌트 + React Hook Form 통합
- [ ] Toast 알림 시스템 구현
- [ ] 레이아웃 컴포넌트 구성

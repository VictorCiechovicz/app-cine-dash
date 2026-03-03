import { Link, useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/use-auth"

export function EstantePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div className="flex min-h-svh flex-col bg-background p-4">
      <header className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-xl font-semibold">Estante</h1>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/busca">Busca</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              logout()
              navigate({ to: "/" })
            }}
          >
            Sair
          </Button>
        </nav>
      </header>
      <main className="flex-1 py-8">
        <p className="text-muted-foreground">Sua estante (apenas usuários autenticados).</p>
      </main>
    </div>
  )
}

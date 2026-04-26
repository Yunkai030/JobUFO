'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signIn, type AuthState } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signIn,
    undefined
  )

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Log in to JobUFO</CardTitle>
        <CardDescription>Welcome back. Enter your credentials.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Signing in…' : 'Log in'}
          </Button>
          <p className="text-sm text-muted-foreground">
            New here?{' '}
            <Link href="/signup" className="underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

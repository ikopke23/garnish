import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '../api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
});
type Fields = z.infer<typeof schema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<Fields>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Fields) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await resetPassword(token, data.password);
      setDone(true);
    } catch (err: unknown) {
      const e = err as Error;
      if (e?.message?.includes('400')) {
        setError('This reset link is invalid or has expired.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Card className="w-full mx-4" style={{ maxWidth: 420 }}>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                This reset link is invalid or has expired.{' '}
                <Link to="/forgot-password" style={{ color: 'var(--primary-hex)' }}>Request a new one.</Link>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <Card className="w-full mx-4" style={{ maxWidth: 420 }}>
        <CardHeader>
          <CardTitle className="text-center" style={{ fontFamily: '"Cinzel", Georgia, serif', color: 'var(--primary-hex)' }}>
            Choose a new password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {done ? (
            <p className="text-center text-sm" style={{ color: 'var(--muted-hex)' }}>
              Password updated — you can now log in.
            </p>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    {error}{' '}
                    {error.includes('invalid or expired') && (
                      <Link to="/forgot-password" style={{ color: 'var(--primary-hex)' }}>Request a new one.</Link>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl><Input type="password" {...field} autoFocus /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="confirm" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '...' : 'Update password'}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full" style={{ color: 'var(--muted-hex)' }}>
            <Link to="/login" style={{ color: 'var(--primary-hex)' }}>Back to login</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

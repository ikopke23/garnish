import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPassword } from '../api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const schema = z.object({
  identifier: z.string().min(1, 'Email or username required'),
});
type Fields = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<Fields>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Fields) => {
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(data.identifier);
      setSent(true);
    } catch (err: unknown) {
      const e = err as Error;
      if (e?.message?.includes('429')) {
        setError('Too many requests, please try again later.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <Card className="w-full mx-4" style={{ maxWidth: 420 }}>
        <CardHeader>
          <CardTitle className="text-center" style={{ fontFamily: '"Cinzel", Georgia, serif', color: 'var(--primary-hex)' }}>
            Reset password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-center text-sm" style={{ color: 'var(--muted-hex)' }}>
              If an account matches, a reset link has been sent. Check your email.
            </p>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email or username</FormLabel>
                        <FormControl>
                          <Input {...field} autoFocus />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '...' : 'Send reset link'}
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

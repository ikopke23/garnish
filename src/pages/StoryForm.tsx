import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/useAuth';
import { getStory, createStory, updateStory } from '../api/stories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const schema = z.object({
  name: z.string().min(1, 'Title required'),
  body: z.string().min(1, 'Body required'),
});
type Fields = z.infer<typeof schema>;

interface Props {
  editMode?: boolean;
}

export default function StoryForm({ editMode }: Props) {
  const { sid } = useParams<{ sid: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', body: '' },
  });

  const watchName = form.watch('name');
  const watchBody = form.watch('body');

  useEffect(() => {
    if (editMode && sid) {
      getStory(sid)
        .then(story => {
          if (story.author_uid !== user?.uid) {
            navigate('/');
            return;
          }
          form.setValue('name', story.name);
          form.setValue('body', story.body);
        })
        .catch(() => setError('Failed to load story.'));
    }
  }, [editMode, sid, user, navigate, form]);

  const onSubmit = async (data: Fields) => {
    setLoading(true);
    setError(null);
    try {
      if (editMode && sid) {
        await updateStory(token!, sid, data.name, data.body);
      } else {
        await createStory(token!, data.name, data.body);
      }
      navigate('/profile');
    } catch {
      setError('Failed to save story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <h4 style={{ marginBottom: '1.5rem', fontFamily: '"Cinzel", Georgia, serif' }}>
        {editMode ? 'Edit Story' : 'New Story'}
      </h4>
      {(watchName || watchBody) && (
        <div className="story-banner mb-4">
          <p className="font-semibold mb-1" style={{ color: 'var(--primary-hex)' }}>{watchName || '(no title)'}</p>
          <p className="mb-1" style={{ fontStyle: 'italic' }}>{watchBody || '(no body)'}</p>
          <p className="mb-0 text-muted-foreground text-sm">— {user?.username}</p>
        </div>
      )}
      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input {...field} required /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="body" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Body</FormLabel>
              <FormControl><Textarea rows={6} {...field} required /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : editMode ? 'Update Story' : 'Create Story'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

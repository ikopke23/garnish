import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/useAuth';
import { createStory, updateStory, getStory } from '../api/stories';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  editMode?: boolean;
}

export default function StoryForm({ editMode }: Props) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { sid } = useParams<{ sid: string }>();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStory, setLoadingStory] = useState(editMode && !!sid);

  useEffect(() => {
    if (!editMode || !sid || !token) return;
    setLoadingStory(true);
    getStory(token, sid)
      .then(s => { setTitle(s.name); setBody(s.body); })
      .catch(() => toast.error('Failed to load story'))
      .finally(() => setLoadingStory(false));
  }, [editMode, sid, token]);

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required');
      return;
    }
    setLoading(true);
    try {
      if (editMode && sid) {
        await updateStory(token!, sid, title.trim(), body.trim());
      } else {
        await createStory(token!, title.trim(), body.trim());
      }
      navigate('/profile');
    } catch {
      toast.error('Failed to save story');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/profile');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Page header */}
      <div className="mb-6">
        <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 10.5, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 4 }}>
          {editMode ? 'Editing' : 'New entry'}
        </p>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 34, fontWeight: 600, margin: 0 }}>
          {editMode ? 'Edit story' : 'Write a story'}
        </h1>
        <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 14, color: 'var(--g-muted)', marginTop: 4 }}>
          Stories give your recipes a personal history.
        </p>
      </div>

      {loadingStory ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          {/* Two-pane */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Left: form */}
            <Card className="flex-1" style={{ borderRadius: 6 }}>
              <CardContent className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label style={{ fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--g-muted)', display: 'block', marginBottom: 6 }}>
                    Title
                  </label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Give your story a title"
                    style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 14 }}
                  />
                </div>
                {/* Body */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label style={{ fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--g-muted)' }}>
                      Story
                    </label>
                    <span style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 11, color: 'var(--g-muted)' }}>
                      {wordCount} word{wordCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Tell the story behind this recipe…"
                    rows={12}
                    style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13.5, resize: 'vertical' }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right: live preview */}
            <Card className="flex-1 overflow-hidden" style={{ borderRadius: 6 }}>
              <div className="p-4" style={{ borderBottom: '1px solid var(--g-border)' }}>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--g-muted)', margin: 0 }}>
                  Preview
                </p>
              </div>
              <CardContent className="p-0">
                {title || body ? (
                  <div className="story-banner" style={{
                    margin: 14,
                    borderLeft: '4px solid var(--g-accent)',
                    background: 'var(--g-card)',
                    padding: '16px 20px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  }}>
                    {title && (
                      <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 17, fontWeight: 600, marginBottom: 8, marginTop: 0 }}>
                        {title}
                      </h2>
                    )}
                    {body ? (
                      <p style={{ fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic', fontSize: 13.5, margin: 0, lineHeight: 1.7 }}>
                        {body}
                      </p>
                    ) : (
                      <p style={{ fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic', fontSize: 13.5, color: 'var(--g-muted)', margin: 0 }}>
                        Start writing to see a preview…
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48" style={{ color: 'var(--g-muted)', fontFamily: 'Lora, Georgia, serif', fontSize: 13 }}>
                    Preview will appear here
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleCancel} style={{ fontFamily: 'Lora, Georgia, serif' }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !title.trim() || !body.trim()} style={{ fontFamily: 'Lora, Georgia, serif' }}>
              {loading ? 'Saving…' : editMode ? 'Save changes' : 'Publish story'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

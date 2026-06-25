import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { importRecipe, ParsedRecipe } from '../api/import';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Mode = 'text' | 'file' | 'url';

export default function RecipeImport() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('text');
  const [textInput, setTextInput] = useState('');
  const [fileText, setFileText] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [parsed, setParsed] = useState<ParsedRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setError(null);
    if (next !== 'text') setTextInput('');
    if (next !== 'file') { setFileText(null); setFileError(null); }
    if (next !== 'url') setUrlInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setFileText(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.txt')) {
      setFileError('Only .txt files are supported.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileText(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!token) return;
    setError(null);

    let payload: { text: string } | { url: string };
    if (mode === 'text') {
      if (!textInput.trim()) { setError('Please paste some recipe text.'); return; }
      payload = { text: textInput };
    } else if (mode === 'file') {
      if (!fileText) { setError('Please select a .txt file.'); return; }
      payload = { text: fileText };
    } else {
      if (!urlInput.trim()) { setError('Please enter a URL.'); return; }
      payload = { url: urlInput.trim() };
    }

    setLoading(true);
    try {
      const result = await importRecipe(token, payload);
      setParsed(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    navigate('/recipes/create', { state: { importedRecipe: parsed } });
  };

  // ── Phase 2: Preview ──────────────────────────────────────────────────────
  if (parsed) {
    const allSteps = parsed.sections.flatMap(s => s.steps);
    const isEmpty = parsed.ingredients.length === 0 && allSteps.length === 0;

    // Group ingredients by section
    const sectionMap = new Map<string, typeof parsed.ingredients>();
    for (const ing of parsed.ingredients) {
      const key = ing.section ?? '';
      if (!sectionMap.has(key)) sectionMap.set(key, []);
      sectionMap.get(key)!.push(ing);
    }
    const ungrouped = sectionMap.get('') ?? [];
    const namedSections = [...sectionMap.entries()].filter(([k]) => k !== '');

    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 10.5, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 4 }}>
            Import preview
          </p>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 34, fontWeight: 600, margin: 0 }}>
            {parsed.name || 'Untitled recipe'}
          </h1>
        </div>

        {/* Empty content warning */}
        {isEmpty && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13.5, color: 'var(--g-text)', margin: 0, fontWeight: 600 }}>
              No ingredients or steps were parsed. The recipe may not have imported correctly.
            </p>
          </div>
        )}

        {/* Parser warnings */}
        {parsed.warnings.length > 0 && (
          <div style={{ background: 'rgba(202,138,4,0.1)', border: '1px solid rgba(202,138,4,0.4)', borderRadius: 6, padding: '12px 16px', marginBottom: 20 }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 500, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 6 }}>
              Parser warnings
            </p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {parsed.warnings.map((w, i) => (
                <li key={i} style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13, color: 'var(--g-text)', marginBottom: 2 }}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Meta */}
        <div className="flex gap-6 mb-6" style={{ flexWrap: 'wrap' }}>
          {[
            { label: 'Prep time', value: `${parsed.prep_time} min` },
            { label: 'Cook time', value: `${parsed.cook_time} min` },
            { label: 'Servings', value: String(parsed.servings) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: 10.5, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 2 }}>{label}</p>
              <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--g-text)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        {parsed.ingredients.length > 0 && (
          <div className="mb-6">
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 10 }}>
              Ingredients
            </h2>
            {ungrouped.length > 0 && (
              <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>
                {ungrouped.map((ing, i) => (
                  <li key={i} style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13.5, marginBottom: 3 }}>
                    {ing.quantity > 0 ? `${ing.quantity} ` : ''}{ing.unit ? `${ing.unit} ` : ''}{ing.name}
                  </li>
                ))}
              </ul>
            )}
            {namedSections.map(([sec, ings]) => (
              <div key={sec} className="mb-3">
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 4 }}>{sec}</p>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {ings.map((ing, i) => (
                    <li key={i} style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13.5, marginBottom: 3 }}>
                      {ing.quantity > 0 ? `${ing.quantity} ` : ''}{ing.unit ? `${ing.unit} ` : ''}{ing.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Equipment */}
        {parsed.equipment.length > 0 && (
          <div className="mb-6">
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 10 }}>
              Equipment
            </h2>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {parsed.equipment.map((eq, i) => (
                <li key={i} style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13.5, marginBottom: 3 }}>{eq.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sections / Steps */}
        {parsed.sections.length > 0 && (
          <div className="mb-6">
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 10 }}>
              Instructions
            </h2>
            {parsed.sections.map((sec, si) => (
              <div key={si} className="mb-5">
                {sec.title && (
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 6 }}>{sec.title}</p>
                )}
                <ol style={{ margin: 0, paddingLeft: 20 }}>
                  {sec.steps.map((step, i) => (
                    <li key={i} style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13.5, marginBottom: 6, lineHeight: 1.6 }}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <Button variant="ghost" onClick={() => setParsed(null)} style={{ fontFamily: 'Lora, Georgia, serif' }}>
            Back
          </Button>
          <Button onClick={handleProceed} style={{ fontFamily: 'Lora, Georgia, serif' }}>
            Proceed to recipe form
          </Button>
        </div>
      </div>
    );
  }

  // ── Phase 1: Input ────────────────────────────────────────────────────────
  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: 'Cinzel, serif',
    fontSize: 12,
    letterSpacing: '1.4px',
    textTransform: 'uppercase',
    padding: '6px 18px',
    borderRadius: 4,
    border: active ? '1px solid var(--g-accent)' : '1px solid var(--g-border)',
    background: active ? 'var(--g-accent)' : 'transparent',
    color: active ? '#fff' : 'var(--g-muted)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 10.5, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--g-muted)', marginBottom: 4 }}>
          New entry
        </p>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 34, fontWeight: 600, margin: 0 }}>
          Import a recipe
        </h1>
        <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 14, color: 'var(--g-muted)', marginTop: 4 }}>
          Paste text, upload a file, or provide a URL to parse a recipe automatically.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-5">
        <button style={tabStyle(mode === 'text')} onClick={() => switchMode('text')}>Paste text</button>
        <button style={tabStyle(mode === 'file')} onClick={() => switchMode('file')}>Upload file</button>
        <button style={tabStyle(mode === 'url')} onClick={() => switchMode('url')}>URL</button>
      </div>

      {/* Input area */}
      <div className="mb-4">
        {mode === 'text' && (
          <Textarea
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            placeholder="Paste your recipe here…"
            rows={12}
            style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13.5, resize: 'vertical' }}
          />
        )}

        {mode === 'file' && (
          <div>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13.5 }}
            />
            {fileError && (
              <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13, color: 'rgba(239,68,68,0.9)', marginTop: 6 }}>{fileError}</p>
            )}
            {fileText && !fileError && (
              <p style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 12, color: 'var(--g-muted)', marginTop: 6 }}>
                File loaded — {fileText.length.toLocaleString()} characters ready to parse.
              </p>
            )}
          </div>
        )}

        {mode === 'url' && (
          <Input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://example.com/recipes/chocolate-cake"
            style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13.5 }}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 13.5 }}>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit */}
      <Button onClick={handleSubmit} disabled={loading} style={{ fontFamily: 'Lora, Georgia, serif' }}>
        {loading ? 'Parsing…' : 'Parse recipe'}
      </Button>
    </div>
  );
}

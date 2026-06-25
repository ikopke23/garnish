import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRecipe, updateRecipe, getRecipe, assignStory, RecipeIngredient, RecipeEquipment, RecipeSection, IngredientGroup } from '../api/recipes';
import { groupIngredientsBySection } from '../utils/ingredients';
import { listFamilies, Family } from '../api/families';
import { listStories, Story } from '../api/stories';
import { listPhotos, uploadPhoto, RecipePhoto } from '../api/photos';
import { useAuth } from '../context/useAuth';
import ReorderModal from '../components/ReorderModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

interface Props {
  editMode?: boolean;
}

export default function RecipeForm({ editMode = false }: Props) {
  const { rid } = useParams<{ rid: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [sections, setSections] = useState<RecipeSection[]>([{ title: '', steps: [''] }]);
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [servings, setServings] = useState(1);
  const [calories, setCalories] = useState(0);
  const [proteins, setProteins] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [ingredientGroups, setIngredientGroups] = useState<IngredientGroup[]>([
    { label: '', ingredients: [{ name: '', quantity: 0, unit: '' }] }
  ]);
  const [reorderIngsOpen, setReorderIngsOpen] = useState(false);
  const [equipmentList, setEquipmentList] = useState<RecipeEquipment[]>([{ name: '' }]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamilyIDs, setSelectedFamilyIDs] = useState<Set<string>>(new Set());
  const [reorderOpen, setReorderOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [includeStory, setIncludeStory] = useState(false);
  const [selectedStoryID, setSelectedStoryID] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<RecipePhoto[]>([]);

  useEffect(() => {
    if (editMode && rid) {
      getRecipe(rid).then(r => {
        setName(r.name);
        setSections(r.sections?.length ? r.sections : [{ title: '', steps: [''] }]);
        setPrepTime(r.prep_time);
        setCookTime(r.cook_time);
        setServings(r.servings || 1);
        setCalories(r.calories || 0);
        setProteins(r.proteins || 0);
        setCarbs(r.carbs || 0);
        setFats(r.fats || 0);
        setEquipmentList(r.equipment?.length ? r.equipment : [{ name: '' }]);
        setIsPublic(r.is_public !== false);
        setIncludeStory(!r.disable_story);
        setSelectedStoryID(r.story_id ?? '');

        // Reconstruct ingredient groups from flat array
        const groups = groupIngredientsBySection(r.ingredients ?? []);
        setIngredientGroups(groups.length ? groups : [{ label: '', ingredients: [{ name: '', quantity: 0, unit: '' }] }]);
      }).catch(() => setError('Failed to load recipe'));
    }
  }, [editMode, rid]);

  useEffect(() => {
    if (!token) return;
    listFamilies(token)
      .then(fs => setFamilies(fs.filter(f => f.name !== 'Public')))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    listStories()
      .then(setStories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editMode && rid) listPhotos(rid).then(setExistingPhotos).catch(() => {});
  }, [editMode, rid]);

  const handleReorderSave = (reordered: RecipeSection[]) => {
    setSections(reordered);
    setReorderOpen(false);
  };

  const addSection = () => setSections([...sections, { title: '', steps: [''] }]);
  const removeSection = (si: number) => setSections(sections.filter((_, i) => i !== si));
  const updateSectionTitle = (si: number, v: string) =>
    setSections(sections.map((s, i) => i === si ? { ...s, title: v } : s));

  const addStep = (si: number) =>
    setSections(sections.map((s, i) => i === si ? { ...s, steps: [...s.steps, ''] } : s));
  const removeStep = (si: number, stepIdx: number) =>
    setSections(sections.map((s, i) => i === si ? { ...s, steps: s.steps.filter((_, j) => j !== stepIdx) } : s));
  const updateStep = (si: number, stepIdx: number, v: string) =>
    setSections(sections.map((s, i) => i === si ? { ...s, steps: s.steps.map((st, j) => j === stepIdx ? v : st) } : s));

  const toggleSectionCollapse = (si: number) =>
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(si)) { next.delete(si); } else { next.add(si); }
      return next;
    });

  // Ingredient group helpers
  const addIngGroup = () =>
    setIngredientGroups([...ingredientGroups, { label: '', ingredients: [{ name: '', quantity: 0, unit: '' }] }]);
  const removeIngGroup = (gi: number) =>
    setIngredientGroups(ingredientGroups.filter((_, i) => i !== gi));
  const updateGroupLabel = (gi: number, v: string) =>
    setIngredientGroups(ingredientGroups.map((g, i) => i === gi ? { ...g, label: v } : g));
  const addIngredient = (gi: number) =>
    setIngredientGroups(ingredientGroups.map((g, i) =>
      i === gi ? { ...g, ingredients: [...g.ingredients, { name: '', quantity: 0, unit: '' }] } : g));
  const removeIngredient = (gi: number, ii: number) =>
    setIngredientGroups(ingredientGroups.map((g, i) =>
      i === gi ? { ...g, ingredients: g.ingredients.filter((_, j) => j !== ii) } : g));
  const updateIngredient = (gi: number, ii: number, field: keyof RecipeIngredient, v: string | number) =>
    setIngredientGroups(ingredientGroups.map((g, i) =>
      i === gi ? { ...g, ingredients: g.ingredients.map((ing, j) => j === ii ? { ...ing, [field]: v } : ing) } : g));

  const addEquipment = () => setEquipmentList([...equipmentList, { name: '' }]);
  const removeEquipment = (i: number) => setEquipmentList(equipmentList.filter((_, idx) => idx !== i));
  const updateEquipment = (i: number, v: string) =>
    setEquipmentList(equipmentList.map((eq, idx) => idx === i ? { ...eq, name: v } : eq));

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPendingPhotos(prev => [...prev, ...files]);
    e.target.value = '';
  };
  const removePending = (idx: number) =>
    setPendingPhotos(prev => prev.filter((_, i) => i !== idx));

  const toggleFamily = (fid: string) =>
    setSelectedFamilyIDs(prev => {
      const next = new Set(prev);
      if (next.has(fid)) { next.delete(fid); } else { next.add(fid); }
      return next;
    });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);

    const payload = {
      name,
      sections: sections.map((s, si) => ({
        title: s.title.trim(),
        steps: s.steps.filter(st => st.trim()),
        position: si,
      })).filter(s => s.title.length > 0 || s.steps.length > 0),
      prep_time: prepTime,
      cook_time: cookTime,
      servings,
      calories,
      proteins,
      carbs,
      fats,
      ingredients: ingredientGroups.flatMap((g, gi) =>
        g.ingredients.filter(i => i.name.trim()).map((ing, ii) => ({
          ...ing,
          section: g.label.trim(),
          position: gi * 1000 + ii,
        }))
      ),
      equipment: equipmentList.filter(e => e.name.trim()),
      family_ids: [...selectedFamilyIDs],
      is_public: isPublic,
    };

    try {
      let recipe;
      if (editMode && rid) {
        recipe = await updateRecipe(token, rid, payload);
      } else {
        recipe = await createRecipe(token, payload);
      }
      await assignStory(
        token,
        recipe.rid,
        includeStory && selectedStoryID ? selectedStoryID : null,
        !includeStory,
      );
      for (const file of pendingPhotos) {
        try { await uploadPhoto(token, recipe.rid, file); } catch { /* non-fatal */ }
      }
      navigate(`/recipes/${recipe.rid}`);
    } catch {
      setError('Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  const showIngReorder = ingredientGroups.length > 1 || ingredientGroups.some(g => g.ingredients.length > 1);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 className="mb-4" style={{ color: 'var(--primary-hex)' }}>
        {editMode ? 'Edit Recipe' : 'Create Recipe'}
      </h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-2 mb-4">
          <Label>Recipe Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Grandma's Apple Pie" />
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <div className="space-y-2 mb-4">
            <Label>Prep Time (min)</Label>
            <Input type="number" min={0} value={prepTime} onChange={e => setPrepTime(+e.target.value)} />
          </div>
          <div className="space-y-2 mb-4">
            <Label>Cook Time (min)</Label>
            <Input type="number" min={0} value={cookTime} onChange={e => setCookTime(+e.target.value)} />
          </div>
          <div className="space-y-2 mb-4">
            <Label>Servings</Label>
            <Input type="number" min={1} value={servings} onChange={e => setServings(+e.target.value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-4 grid-cols-1 gap-4">
          <div className="space-y-2 mb-4">
            <Label>Calories (kcal)</Label>
            <Input type="number" min={0} value={calories} onChange={e => setCalories(+e.target.value)} />
          </div>
          <div className="space-y-2 mb-4">
            <Label>Protein (g)</Label>
            <Input type="number" min={0} value={proteins} onChange={e => setProteins(+e.target.value)} />
          </div>
          <div className="space-y-2 mb-4">
            <Label>Carbs (g)</Label>
            <Input type="number" min={0} value={carbs} onChange={e => setCarbs(+e.target.value)} />
          </div>
          <div className="space-y-2 mb-4">
            <Label>Fat (g)</Label>
            <Input type="number" min={0} value={fats} onChange={e => setFats(+e.target.value)} />
          </div>
        </div>

        {/* Ingredients */}
        <h5 className="mt-3">Ingredients</h5>
        {ingredientGroups.map((group, gi) => (
          <div key={gi} className="recipe-section border rounded p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Input
                placeholder="Section (e.g. For the sauce) — optional"
                value={group.label}
                onChange={e => updateGroupLabel(gi, e.target.value)}
                style={{ fontWeight: group.label ? 600 : undefined }}
              />
              <Button
                size="sm"
                variant="outline"
                style={{ borderColor: 'var(--accent-hex)', color: 'var(--accent-hex)' }}
                onClick={() => removeIngGroup(gi)}
                disabled={ingredientGroups.length === 1}
                type="button"
              >&#x2715;</Button>
            </div>
            {group.ingredients.map((ing, ii) => (
              <div key={ii} className="flex gap-2 items-center mb-2">
                <div className="flex-[5]">
                  <Input placeholder="Ingredient name" value={ing.name} onChange={e => updateIngredient(gi, ii, 'name', e.target.value)} />
                </div>
                <div className="flex-[2]">
                  <Input type="number" placeholder="Qty" min={0} step="0.25" value={ing.quantity || ''} onChange={e => updateIngredient(gi, ii, 'quantity', +e.target.value)} />
                </div>
                <div className="flex-[3]">
                  <Input placeholder="Unit (cups, g...)" value={ing.unit} onChange={e => updateIngredient(gi, ii, 'unit', e.target.value)} />
                </div>
                <div className="flex-[2]">
                  <Button
                    size="sm"
                    variant="outline"
                    style={{ borderColor: 'var(--accent-hex)', color: 'var(--accent-hex)' }}
                    onClick={() => removeIngredient(gi, ii)}
                    disabled={group.ingredients.length === 1 && ingredientGroups.length === 1}
                    type="button"
                  >&#x2715;</Button>
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => addIngredient(gi)} type="button">+ Add Ingredient</Button>
          </div>
        ))}
        <div className="flex gap-2 mb-3">
          <Button size="sm" variant="outline" onClick={addIngGroup} type="button">
            + Add Section
          </Button>
          {showIngReorder && (
            <Button size="sm" variant="outline" onClick={() => setReorderIngsOpen(true)} type="button">
              ⠿ Reorder Ingredients
            </Button>
          )}
        </div>

        {/* Equipment */}
        <h5 className="mt-3">Equipment</h5>
        {equipmentList.map((eq, i) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <div className="flex-[10]">
              <Input placeholder="Equipment name" value={eq.name} onChange={e => updateEquipment(i, e.target.value)} />
            </div>
            <div className="flex-[2]">
              <Button
                size="sm"
                variant="outline"
                style={{ borderColor: 'var(--accent-hex)', color: 'var(--accent-hex)' }}
                onClick={() => removeEquipment(i)}
                disabled={equipmentList.length === 1}
                type="button"
              >&#x2715;</Button>
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={addEquipment} className="mb-3" type="button">+ Add Equipment</Button>

        {/* Steps */}
        <h5 className="mt-3">Steps</h5>
        {sections.map((section, si) => {
          const isCollapsed = collapsedSections.has(si);
          return (
            <div key={si} className="recipe-section border rounded p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Button size="sm" variant="outline" onClick={() => toggleSectionCollapse(si)} type="button">
                  {isCollapsed ? '▶' : '▼'}
                </Button>
                <Input
                  placeholder="Section title (e.g. For the Sauce)"
                  value={section.title}
                  onChange={e => updateSectionTitle(si, e.target.value)}
                  style={{ fontWeight: 600 }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  style={{ borderColor: 'var(--accent-hex)', color: 'var(--accent-hex)' }}
                  onClick={() => removeSection(si)}
                  disabled={sections.length === 1}
                  type="button"
                >&#x2715;</Button>
              </div>
              {!isCollapsed && (
                <>
                  {section.steps.map((step, i) => (
                    <div key={i} className="flex gap-2 items-start mb-2">
                      <span className="pt-2" style={{ color: 'var(--muted-hex)', minWidth: '1.5rem', textAlign: 'right' }}>{i + 1}.</span>
                      <div className="flex-1">
                        <Textarea rows={2} placeholder={`Step ${i + 1}`}
                               value={step} onChange={e => updateStep(si, i, e.target.value)} />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        style={{ borderColor: 'var(--accent-hex)', color: 'var(--accent-hex)' }}
                        onClick={() => removeStep(si, i)}
                        disabled={section.steps.length === 1}
                        type="button"
                      >&#x2715;</Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => addStep(si)} type="button">+ Add Step</Button>
                </>
              )}
            </div>
          );
        })}
        <div className="flex gap-2 mb-4">
          <Button size="sm" variant="outline" onClick={addSection} type="button">
            + Add Section
          </Button>
          {sections.length > 1 && (
            <Button size="sm" variant="outline" onClick={() => setReorderOpen(true)} type="button">
              ⠿ Reorder Sections
            </Button>
          )}
        </div>

        <ReorderModal
          mode="sections"
          isOpen={reorderOpen}
          items={sections}
          onSave={handleReorderSave}
          onCancel={() => setReorderOpen(false)}
        />

        <ReorderModal
          mode="ingredients"
          isOpen={reorderIngsOpen}
          items={ingredientGroups}
          onSave={groups => { setIngredientGroups(groups); setReorderIngsOpen(false); }}
          onCancel={() => setReorderIngsOpen(false)}
        />

        {/* Family visibility */}
        <div className="space-y-2 mb-4">
          <Label>Visibility</Label>

          <div className="mb-3 flex flex-col gap-2">
            <label className={`sharing-card${isPublic ? ' active' : ''}`}>
              <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
              <span>Public</span>
            </label>
            {families.map(f => (
              <label key={f.fid} className={`sharing-card${selectedFamilyIDs.has(f.fid) ? ' active' : ''}`}>
                <input type="checkbox" checked={selectedFamilyIDs.has(f.fid)} onChange={() => toggleFamily(f.fid)} />
                <span>{f.name}</span>
              </label>
            ))}
          </div>

          <small style={{ color: 'var(--muted-hex)' }}>
            Uncheck Public to limit visibility to selected families only.
          </small>
        </div>

        {/* Story */}
        <div className="space-y-2 mb-4 mt-3">
          <div className="flex items-center gap-3 mb-2">
            <Switch id="includeStory" checked={includeStory} onCheckedChange={setIncludeStory} />
            <Label htmlFor="includeStory">Include story</Label>
          </div>
          {includeStory && (
            <Select value={selectedStoryID || 'none'} onValueChange={v => setSelectedStoryID(v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="— no story selected —" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— no story selected —</SelectItem>
                {stories.filter(s => !s.is_placeholder).map(s => (
                  <SelectItem key={s.sid} value={s.sid}>{s.name} — {s.author_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Photos */}
        <div className="space-y-2 mb-4 mt-3">
          <Label>Photos</Label>
          {existingPhotos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {existingPhotos.map(p => (
                <img
                  key={p.pid}
                  src={p.link}
                  alt={p.name}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-hex)' }}
                />
              ))}
            </div>
          )}
          {pendingPhotos.length > 0 && (
            <div className="flex flex-col gap-1">
              {pendingPhotos.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--muted-hex)' }}>{f.name}</span>
                  <button
                    type="button"
                    onClick={() => removePending(i)}
                    style={{ color: 'var(--accent-hex)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >&#x2715;</button>
                </div>
              ))}
            </div>
          )}
          <Input type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="text-sm" />
          <small style={{ color: 'var(--muted-hex)' }}>
            Photos are uploaded when you save the recipe.
          </small>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : editMode ? 'Update Recipe' : 'Create Recipe'}
          </Button>
          <Button variant="link" type="button" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

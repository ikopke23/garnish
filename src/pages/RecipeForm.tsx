import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Form, FormGroup, Label, Input, Button, Row, Col, Alert
} from 'reactstrap';
import { createRecipe, updateRecipe, getRecipe, assignStory, RecipeIngredient, RecipeEquipment, RecipeSection, IngredientGroup } from '../api/recipes';
import { groupIngredientsBySection } from '../utils/ingredients';
import { listFamilies, Family } from '../api/families';
import { listStories, Story } from '../api/stories';
import { useAuth } from '../context/useAuth';
import ReorderModal from '../components/ReorderModal';

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

  useEffect(() => {
    if (editMode && rid) {
      getRecipe(rid).then(r => {
        setName(r.name);
        setSections(r.sections?.length ? r.sections : [{ title: '', steps: [''] }]);
        setPrepTime(r.prep_time);
        setCookTime(r.cook_time);
        setServings(r.servings || 1);
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
    if (!token) return;
    listStories(token)
      .then(setStories)
      .catch(() => {});
  }, [token]);

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
      navigate(`/recipes/${recipe.rid}`);
    } catch {
      setError('Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  const showIngReorder = ingredientGroups.length > 1 || ingredientGroups.some(g => g.ingredients.length > 1);

  return (
    <Container className="py-4" style={{ maxWidth: '700px' }}>
      <h2 className="mb-4" style={{ color: 'var(--color-teal)' }}>
        {editMode ? 'Edit Recipe' : 'Create Recipe'}
      </h2>

      {error && <Alert color="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Recipe Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Grandma's Apple Pie" />
        </FormGroup>

        <Row>
          <Col md={4}>
            <FormGroup>
              <Label>Prep Time (min)</Label>
              <Input type="number" min={0} value={prepTime} onChange={e => setPrepTime(+e.target.value)} />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label>Cook Time (min)</Label>
              <Input type="number" min={0} value={cookTime} onChange={e => setCookTime(+e.target.value)} />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label>Servings</Label>
              <Input type="number" min={1} value={servings} onChange={e => setServings(+e.target.value)} />
            </FormGroup>
          </Col>
        </Row>

        {/* Ingredients */}
        <h5 className="mt-3">Ingredients</h5>
        {ingredientGroups.map((group, gi) => (
          <div key={gi} className="recipe-section border rounded p-3 mb-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Input
                placeholder="Section (e.g. For the sauce) — optional"
                value={group.label}
                onChange={e => updateGroupLabel(gi, e.target.value)}
                style={{ fontWeight: group.label ? 600 : undefined }}
              />
              <Button
                color="danger" size="sm" outline
                onClick={() => removeIngGroup(gi)}
                disabled={ingredientGroups.length === 1}
              >&#x2715;</Button>
            </div>
            {group.ingredients.map((ing, ii) => (
              <Row key={ii} className="mb-2 g-2 align-items-center">
                <Col md={5}>
                  <Input placeholder="Ingredient name" value={ing.name} onChange={e => updateIngredient(gi, ii, 'name', e.target.value)} />
                </Col>
                <Col md={2}>
                  <Input type="number" placeholder="Qty" min={0} step="0.25" value={ing.quantity || ''} onChange={e => updateIngredient(gi, ii, 'quantity', +e.target.value)} />
                </Col>
                <Col md={3}>
                  <Input placeholder="Unit (cups, g...)" value={ing.unit} onChange={e => updateIngredient(gi, ii, 'unit', e.target.value)} />
                </Col>
                <Col md={2}>
                  <Button color="danger" size="sm" outline onClick={() => removeIngredient(gi, ii)} disabled={group.ingredients.length === 1 && ingredientGroups.length === 1}>&#x2715;</Button>
                </Col>
              </Row>
            ))}
            <Button color="primary" size="sm" outline onClick={() => addIngredient(gi)}>+ Add Ingredient</Button>
          </div>
        ))}
        <div className="d-flex gap-2 mb-3">
          <Button color="primary" size="sm" outline onClick={addIngGroup}>
            + Add Section
          </Button>
          {showIngReorder && (
            <Button size="sm" outline color="secondary" onClick={() => setReorderIngsOpen(true)}>
              ⠿ Reorder Ingredients
            </Button>
          )}
        </div>

        {/* Equipment */}
        <h5 className="mt-3">Equipment</h5>
        {equipmentList.map((eq, i) => (
          <Row key={i} className="mb-2 g-2 align-items-center">
            <Col md={10}>
              <Input placeholder="Equipment name" value={eq.name} onChange={e => updateEquipment(i, e.target.value)} />
            </Col>
            <Col md={2}>
              <Button color="danger" size="sm" outline onClick={() => removeEquipment(i)} disabled={equipmentList.length === 1}>&#x2715;</Button>
            </Col>
          </Row>
        ))}
        <Button color="primary" size="sm" outline onClick={addEquipment} className="mb-3">+ Add Equipment</Button>

        {/* Steps */}
        <h5 className="mt-3">Steps</h5>
        {sections.map((section, si) => {
          const isCollapsed = collapsedSections.has(si);
          return (
            <div key={si} className="recipe-section border rounded p-3 mb-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Button color="secondary" size="sm" outline onClick={() => toggleSectionCollapse(si)}>
                  {isCollapsed ? '▶' : '▼'}
                </Button>
                <Input
                  placeholder="Section title (e.g. For the Sauce)"
                  value={section.title}
                  onChange={e => updateSectionTitle(si, e.target.value)}
                  style={{ fontWeight: 600 }}
                />
                <Button color="danger" size="sm" outline onClick={() => removeSection(si)}
                        disabled={sections.length === 1}>&#x2715;</Button>
              </div>
              {!isCollapsed && (
                <>
                  {section.steps.map((step, i) => (
                    <Row key={i} className="mb-2 g-2 align-items-start">
                      <Col xs={1} className="text-muted pt-2 text-end">{i + 1}.</Col>
                      <Col xs={9}>
                        <Input type="textarea" rows={2} placeholder={`Step ${i + 1}`}
                               value={step} onChange={e => updateStep(si, i, e.target.value)} />
                      </Col>
                      <Col xs={2}>
                        <Button color="danger" size="sm" outline onClick={() => removeStep(si, i)}
                                disabled={section.steps.length === 1}>&#x2715;</Button>
                      </Col>
                    </Row>
                  ))}
                  <Button color="secondary" size="sm" outline onClick={() => addStep(si)}>+ Add Step</Button>
                </>
              )}
            </div>
          );
        })}
        <div className="d-flex gap-2 mb-4">
          <Button color="primary" size="sm" outline onClick={addSection}>
            + Add Section
          </Button>
          {sections.length > 1 && (
            <Button color="secondary" size="sm" outline onClick={() => setReorderOpen(true)}>
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
        <FormGroup>
          <Label>Visibility</Label>

          <div className="sharing-cards mb-3">
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

          <small className="text-muted">
            Uncheck Public to limit visibility to selected families only.
          </small>
        </FormGroup>

        {/* Story */}
        <FormGroup className="mt-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Input
              type="switch"
              id="includeStory"
              checked={includeStory}
              onChange={e => setIncludeStory(e.target.checked)}
            />
            <Label for="includeStory" className="mb-0">Include story</Label>
          </div>
          {includeStory && (
            <Input
              type="select"
              value={selectedStoryID}
              onChange={e => setSelectedStoryID(e.target.value)}
            >
              <option value="">— no story selected —</option>
              {stories.map(s => (
                <option key={s.sid} value={s.sid}>
                  {s.name} — {s.author_name}
                </option>
              ))}
            </Input>
          )}
        </FormGroup>

        <div className="d-flex gap-2">
          <Button color="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : editMode ? 'Update Recipe' : 'Create Recipe'}
          </Button>
          <Button color="link" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </Form>
    </Container>
  );
}

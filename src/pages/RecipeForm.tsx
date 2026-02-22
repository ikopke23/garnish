import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Form, FormGroup, Label, Input, Button, Row, Col, Alert
} from 'reactstrap';
import { createRecipe, updateRecipe, getRecipe, RecipeIngredient, RecipeEquipment } from '../api/recipes';
import { useAuth } from '../context/AuthContext';

interface Props {
  editMode?: boolean;
}

export default function RecipeForm({ editMode = false }: Props) {
  const { rid } = useParams<{ rid: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([{ name: '', quantity: 0, unit: '' }]);
  const [equipmentList, setEquipmentList] = useState<RecipeEquipment[]>([{ name: '' }]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode && rid) {
      getRecipe(rid).then(r => {
        setName(r.name);
        setSteps(r.steps?.length ? r.steps : ['']);
        setPrepTime(r.prep_time);
        setCookTime(r.cook_time);
        setServings(r.servings || 1);
        setIngredients(r.ingredients?.length ? r.ingredients : [{ name: '', quantity: 0, unit: '' }]);
        setEquipmentList(r.equipment?.length ? r.equipment : [{ name: '' }]);
      }).catch(() => setError('Failed to load recipe'));
    }
  }, [editMode, rid]);

  const addStep = () => setSteps([...steps, '']);
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));
  const updateStep = (i: number, v: string) => setSteps(steps.map((s, idx) => idx === i ? v : s));

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: 0, unit: '' }]);
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: keyof RecipeIngredient, v: string | number) =>
    setIngredients(ingredients.map((ing, idx) => idx === i ? { ...ing, [field]: v } : ing));

  const addEquipment = () => setEquipmentList([...equipmentList, { name: '' }]);
  const removeEquipment = (i: number) => setEquipmentList(equipmentList.filter((_, idx) => idx !== i));
  const updateEquipment = (i: number, v: string) =>
    setEquipmentList(equipmentList.map((eq, idx) => idx === i ? { ...eq, name: v } : eq));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);

    const payload = {
      name,
      steps: steps.filter(s => s.trim()),
      prep_time: prepTime,
      cook_time: cookTime,
      servings,
      ingredients: ingredients.filter(i => i.name.trim()),
      equipment: equipmentList.filter(e => e.name.trim()),
    };

    try {
      let recipe;
      if (editMode && rid) {
        recipe = await updateRecipe(token, rid, payload);
      } else {
        recipe = await createRecipe(token, payload);
      }
      navigate(`/recipes/${recipe.rid}`);
    } catch {
      setError('Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

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
        {ingredients.map((ing, i) => (
          <Row key={i} className="mb-2 g-2 align-items-center">
            <Col md={5}>
              <Input placeholder="Ingredient name" value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} />
            </Col>
            <Col md={2}>
              <Input type="number" placeholder="Qty" min={0} step="0.25" value={ing.quantity || ''} onChange={e => updateIngredient(i, 'quantity', +e.target.value)} />
            </Col>
            <Col md={3}>
              <Input placeholder="Unit (cups, g...)" value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)} />
            </Col>
            <Col md={2}>
              <Button color="danger" size="sm" outline onClick={() => removeIngredient(i)} disabled={ingredients.length === 1}>&#x2715;</Button>
            </Col>
          </Row>
        ))}
        <Button color="secondary" size="sm" outline onClick={addIngredient} className="mb-3">+ Add Ingredient</Button>

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
        <Button color="secondary" size="sm" outline onClick={addEquipment} className="mb-3">+ Add Equipment</Button>

        {/* Steps */}
        <h5 className="mt-3">Steps</h5>
        {steps.map((step, i) => (
          <Row key={i} className="mb-2 g-2 align-items-start">
            <Col xs={1} className="text-muted pt-2 text-end">{i + 1}.</Col>
            <Col xs={9}>
              <Input type="textarea" rows={2} placeholder={`Step ${i + 1}`} value={step} onChange={e => updateStep(i, e.target.value)} />
            </Col>
            <Col xs={2}>
              <Button color="danger" size="sm" outline onClick={() => removeStep(i)} disabled={steps.length === 1}>&#x2715;</Button>
            </Col>
          </Row>
        ))}
        <Button color="secondary" size="sm" outline onClick={addStep} className="mb-4">+ Add Step</Button>

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

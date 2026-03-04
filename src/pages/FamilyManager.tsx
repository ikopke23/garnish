import { useEffect, useState, FormEvent } from 'react';
import {
  Container, Card, CardBody, Button, Input, Form, FormGroup, Alert, Spinner, Row, Col
} from 'reactstrap';
import { useAuth } from '../context/useAuth';
import { listFamilies, createFamily, addMember, Family } from '../api/families';

export default function FamilyManager() {
  const { token } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newMemberUsername, setNewMemberUsername] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listFamilies(token)
      .then(setFamilies)
      .catch(() => setError('Failed to load families'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCreateFamily = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !newFamilyName.trim()) return;
    try {
      const f = await createFamily(token, newFamilyName.trim());
      setFamilies([f, ...families]);
      setNewFamilyName('');
    } catch {
      setError('Failed to create family');
    }
  };

  const handleAddMember = async (fid: string) => {
    if (!token || !newMemberUsername[fid]?.trim()) return;
    try {
      await addMember(token, fid, newMemberUsername[fid].trim());
      setNewMemberUsername({ ...newMemberUsername, [fid]: '' });
    } catch {
      setError('Failed to add member');
    }
  };

  if (loading) return <Container className="py-4"><Spinner /></Container>;

  return (
    <Container className="py-4" style={{ maxWidth: '700px' }}>
      <h2 className="mb-4" style={{ color: 'var(--color-teal)' }}>Family Manager</h2>

      {error && <Alert color="danger" toggle={() => setError(null)}>{error}</Alert>}

      <Card className="mb-4">
        <CardBody>
          <h5>Create a Family</h5>
          <Form onSubmit={handleCreateFamily}>
            <FormGroup className="d-flex gap-2">
              <Input
                placeholder="Family name"
                value={newFamilyName}
                onChange={e => setNewFamilyName(e.target.value)}
              />
              <Button color="primary" type="submit">Create</Button>
            </FormGroup>
          </Form>
        </CardBody>
      </Card>

      {families.length === 0 ? (
        <p className="text-muted">No families yet. Create one above!</p>
      ) : (
        families.map(family => (
          <Card key={family.fid} className="mb-3">
            <CardBody>
              <h5>{family.name}</h5>
              <Row className="mt-2 g-2 align-items-center">
                <Col>
                  <Input
                    placeholder="Member username to add"
                    value={newMemberUsername[family.fid] || ''}
                    onChange={e => setNewMemberUsername({ ...newMemberUsername, [family.fid]: e.target.value })}
                  />
                </Col>
                <Col xs="auto">
                  <Button color="secondary" size="sm" onClick={() => handleAddMember(family.fid)}>
                    Add Member
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        ))
      )}
    </Container>
  );
}

import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { register } from '../api/auth';
import { useAuth } from '../context/useAuth';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await register(username, email, password);
      login(token);
      navigate('/');
    } catch {
      setError('Registration failed. Username or email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '420px' }}>
      <Card>
        <CardBody>
          <h3 className="mb-4 text-center" style={{ color: 'var(--color-teal)' }}>Create an account</h3>
          {error && <Alert color="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Username</Label>
              <Input value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
            </FormGroup>
            <FormGroup>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </FormGroup>
            <FormGroup>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </FormGroup>
            <Button color="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </Form>
          <p className="text-center mt-3 text-muted small">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </CardBody>
      </Card>
    </Container>
  );
}

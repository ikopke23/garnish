import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login: loginCtx } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await login(username, password);
      loginCtx(token);
      navigate('/');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '420px' }}>
      <Card>
        <CardBody>
          <h3 className="mb-4 text-center" style={{ color: 'var(--color-teal)' }}>Welcome back</h3>
          {error && <Alert color="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Username</Label>
              <Input value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
            </FormGroup>
            <FormGroup>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </FormGroup>
            <Button color="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
          <p className="text-center mt-3 text-muted small">
            No account? <Link to="/register">Register</Link>
          </p>
        </CardBody>
      </Card>
    </Container>
  );
}

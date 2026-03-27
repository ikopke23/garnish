import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FormGroup, Label, Input, Button } from 'reactstrap';
import { login } from '../api/auth';
import { useAuth } from '../context/useAuth';
import AuthForm from '../components/AuthForm';

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
    <AuthForm
      title="Welcome back"
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
      submitLabel="Login"
      fields={<>
        <FormGroup>
          <Label>Username</Label>
          <Input value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
        </FormGroup>
        <FormGroup>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </FormGroup>
      </>}
      footer={<>
        <Button
          disabled
          className="w-100 mt-2"
          style={{ backgroundColor: '#B0197E', borderColor: '#B0197E', color: '#fff', opacity: 1 }}
        >
          Login with CSH SSO
        </Button>
        <p className="text-center mt-3 text-muted small">
          No account? <Link to="/register">Register</Link>
        </p>
      </>}
    />
  );
}

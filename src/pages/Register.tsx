import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FormGroup, Label, Input } from 'reactstrap';
import { register } from '../api/auth';
import { useAuth } from '../context/useAuth';
import AuthForm from '../components/AuthForm';

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
    <AuthForm
      title="Create an account"
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
      submitLabel="Register"
      fields={<>
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
      </>}
      footer={
        <p className="text-center mt-3 text-muted small">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      }
    />
  );
}

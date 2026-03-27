import { FormEvent, ReactNode } from 'react';
import { Container, Card, CardBody, Form, Button, Alert } from 'reactstrap';

interface Props {
  title: string;
  fields: ReactNode;
  onSubmit: (e: FormEvent) => void;
  error: string | null;
  loading: boolean;
  submitLabel: string;
  footer?: ReactNode;
}

export default function AuthForm({ title, fields, onSubmit, error, loading, submitLabel, footer }: Props) {
  return (
    <Container className="py-5" style={{ maxWidth: '420px' }}>
      <Card>
        <CardBody>
          <h3 className="mb-4 text-center" style={{ color: 'var(--color-teal)' }}>{title}</h3>
          {error && <Alert color="danger">{error}</Alert>}
          <Form onSubmit={onSubmit}>
            {fields}
            <Button color="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? '...' : submitLabel}
            </Button>
          </Form>
          {footer}
        </CardBody>
      </Card>
    </Container>
  );
}

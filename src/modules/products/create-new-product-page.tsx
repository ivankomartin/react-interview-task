import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { PageHeader } from '../../components/page-header';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../../components/select';
import { Alert, AlertDescription, AlertTitle } from '../../components/alert';
import { Separator } from '../../components/separator';
import { LoaderCircle, Milk, PackageCheck, TriangleAlert } from 'lucide-react';

import type { Company, CreateProductBody, User } from '../../lib/api/types';
import { fetchCompaniesList } from '../../lib/api/companies';
import { fetchUsersList } from '../../lib/api/users';
import { createProduct } from '../../lib/api/products';

const schema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  packaging: Yup.string().required('Packaging is required'),
  deposit: Yup.number()
    .positive('Deposit must be positive')
    .integer()
    .required('Deposit is required'),
  volume: Yup.number()
    .positive('Volume must be positive')
    .integer()
    .max(5000, 'Volume looks too large')
    .required('Volume is required'),
  companyId: Yup.number()
    .positive('Company is required')
    .required('Company is required'),
  registeredById: Yup.number()
    .positive('Registered by is required')
    .required('Registered by is required'),
});

export default function NewProductPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const companiesQuery = useQuery<Company[]>({
    queryKey: ['companies', 'list'],
    queryFn: fetchCompaniesList,
    staleTime: 1000 * 60 * 10,
  });

  const usersQuery = useQuery<User[]>({
    queryKey: ['users', 'list'],
    queryFn: fetchUsersList,
    staleTime: 1000 * 60 * 10,
  });

  const mutation = useMutation({
    mutationFn: (values: CreateProductBody) => createProduct(values),

    onMutate: () => {
      setAlert({
        type: 'info',
        title: 'Saving product',
        message: 'Please wait while we store your data...',
      });
    },

    onSuccess: (res) => {
      qc.setQueryData(['product', res.data.id], res.data);
      qc.invalidateQueries({ queryKey: ['products'] });

      setAlert({
        type: 'success',
        title: 'Product created',
        message: `#${res.data.id} – ${res.data.name} created as inactive`,
        productId: res.data.id,
      });
    },

    onError: (err: any) => {
      setAlert({
        type: 'error',
        title: 'Failed to create product',
        message: err?.message ?? 'Unknown error',
      });
    },
  });

  const [alert, setAlert] = React.useState<null | {
    type: 'info' | 'success' | 'error';
    title: string;
    message: string;
    productId?: number;
  }>(null);

  return (
    <div className="pb-8">
      <PageHeader
        title="Add new product"
        description="Create a product entry. New products are inactive by default."
        icon={<Milk size={28} />}
      />

      {alert && (
        <div className="mt-4">
          <Alert
            variant={alert.type === 'error' ? 'destructive' : 'default'}
            role="status"
            aria-live="polite"
          >
            {alert.type === 'error' ? (
              <TriangleAlert />
            ) : alert.type === 'success' ? (
              <PackageCheck />
            ) : (
              <LoaderCircle className="animate-spin" />
            )}

            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>
              <p>{alert.message}</p>

              {alert.type === 'success' && alert.productId ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link
                      to={`/products/${alert.productId}`}
                      state={{
                        product: qc.getQueryData(['product', alert.productId]),
                      }}
                    >
                      Open product detail
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setAlert(null)}
                  >
                    Close
                  </Button>
                </div>
              ) : null}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <Card className="mt-4 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Product details</CardTitle>
        </CardHeader>
        <Separator className="my-1" />
        <CardContent className="grid gap-4 max-w-2xl">
          <Formik
            initialValues={{
              name: '',
              packaging: 'can',
              deposit: 25,
              volume: 330,
              companyId: '',
              registeredById: '',
            }}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              setAlert({
                type: 'info',
                title: 'Saving product',
                message: 'Please wait while we store your data...',
              });

              try {
                const res = await mutation.mutateAsync({
                  ...values,
                  companyId: Number(values.companyId),
                  registeredById: Number(values.registeredById),
                } as unknown as CreateProductBody);

                qc.invalidateQueries({ queryKey: ['products'] });

                setAlert({
                  type: 'success',
                  title: 'Product created',
                  message: `#${res.data.id} – ${res.data.name} created as inactive`,
                  productId: res.data.id,
                });

                resetForm();
              } catch (err: any) {
                setAlert({
                  type: 'error',
                  title: 'Failed to create product',
                  message: err?.message || 'Unknown error',
                });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Field
                    as={Input}
                    id="name"
                    name="name"
                    placeholder="Coca Cola"
                  />
                  <ErrorMessage
                    name="name"
                    component="p"
                    className="text-xs text-destructive"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Packaging</Label>
                  <Select
                    value={values.packaging}
                    onValueChange={(v) => setFieldValue('packaging', v)}
                  >
                    <SelectTrigger size="default">
                      <SelectValue placeholder="Select packaging" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Common</SelectLabel>
                        {(
                          ['pet', 'can', 'glass', 'tetra', 'other'] as const
                        ).map((p) => (
                          <SelectItem key={p} value={p}>
                            {p.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <ErrorMessage
                    name="packaging"
                    component="p"
                    className="text-xs text-destructive"
                  />
                </div>

                {/* Deposit */}
                <div className="grid gap-2">
                  <Label htmlFor="deposit">Deposit (in cents)</Label>
                  <Field as={Input} id="deposit" name="deposit" type="number" />
                  <ErrorMessage
                    name="deposit"
                    component="p"
                    className="text-xs text-destructive"
                  />
                </div>

                {/* Volume */}
                <div className="grid gap-2">
                  <Label htmlFor="volume">Volume (ml)</Label>
                  <Field as={Input} id="volume" name="volume" type="number" />
                  <ErrorMessage
                    name="volume"
                    component="p"
                    className="text-xs text-destructive"
                  />
                </div>

                {/* Company */}
                <div className="grid gap-2">
                  <Label>Company</Label>
                  <Select
                    value={values.companyId}
                    onValueChange={(v) => setFieldValue('companyId', v)}
                  >
                    <SelectTrigger size="default">
                      <SelectValue
                        placeholder={
                          companiesQuery.isLoading
                            ? 'Loading companies...'
                            : 'Select a company'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Companies</SelectLabel>
                        {companiesQuery.data?.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <ErrorMessage
                    name="companyId"
                    component="p"
                    className="text-xs text-destructive"
                  />
                </div>

                {/* Registered By */}
                <div className="grid gap-2">
                  <Label>Registered by</Label>
                  <Select
                    value={values.registeredById}
                    onValueChange={(v) => setFieldValue('registeredById', v)}
                  >
                    <SelectTrigger size="default">
                      <SelectValue
                        placeholder={
                          usersQuery.isLoading
                            ? 'Loading users...'
                            : 'Select user'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Users</SelectLabel>
                        {usersQuery.data?.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.firstName} {u.lastName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <ErrorMessage
                    name="registeredById"
                    component="p"
                    className="text-xs text-destructive"
                  />
                </div>

                <CardFooter className="gap-2 mt-2 p-0 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || mutation.isPending}
                  >
                    {mutation.isPending ? 'Submitting...' : 'Create product'}
                  </Button>
                </CardFooter>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}

import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { i18n } from 'src/i18n';
import actions from 'src/modules/auth/authActions';
import selectors from 'src/modules/auth/authSelectors';
import yupFormSchemas from 'src/modules/shared/yup/yupFormSchemas';
import AuthField from 'src/view/auth/styles/AuthField';
import AuthSplitLayout from 'src/view/auth/styles/AuthSplitLayout';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  email: yupFormSchemas.string(i18n('user.fields.email'), {
    required: true,
  }),
  password: yupFormSchemas.string(
    i18n('user.fields.password'),
    {
      required: true,
    },
  ),
});

function SignupPage() {
  const dispatch = useDispatch();
  const location = useLocation();

  const loading = useSelector(selectors.selectLoading);

  const externalErrorMessage = useSelector(
    selectors.selectErrorMessage,
  );

  const emailFromInvitation = queryString.parse(
    location.search,
  ).email;

  const backgroundImageUrl = useSelector(
    selectors.selectBackgroundImageUrl,
  );
  const logoUrl = useSelector(selectors.selectLogoUrl);

  useEffect(() => {
    dispatch(actions.doClearErrorMessage());
  }, [dispatch]);

  const [initialValues] = useState({
    email: emailFromInvitation || '',
    password: '',
  });

  const form = useForm({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const onSubmit = ({ email, password }) => {
    dispatch(
      actions.doRegisterEmailAndPassword(email, password),
    );
  };

  return (
    <AuthSplitLayout
      backgroundImageUrl={backgroundImageUrl || '/images/signup.jpg'}
      logoUrl={logoUrl}
      icon="fas fa-user-plus"
      title={i18n('auth.layout.signupTitle')}
      subtitle={i18n('auth.layout.signupSubtitle')}
      footer={
        <>
          {i18n('auth.layout.haveAccount')}
          <Link to="/auth/signin">{i18n('auth.signin')}</Link>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <AuthField
            name="email"
            label={i18n('user.fields.email')}
            icon="far fa-envelope"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            autoFocus
            externalErrorMessage={externalErrorMessage}
          />

          <AuthField
            name="password"
            label={i18n('user.fields.password')}
            icon="fas fa-lock"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />

          <button
            className="btn btn-block btn-primary mt-4"
            type="submit"
            disabled={loading}
          >
            <ButtonIcon loading={loading} />
            {i18n('auth.signup')}
            {!loading && <i className="fas fa-arrow-right ml-2" />}
          </button>
        </form>
      </FormProvider>
    </AuthSplitLayout>
  );
}

export default SignupPage;

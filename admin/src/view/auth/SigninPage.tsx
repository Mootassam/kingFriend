import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { i18n } from 'src/i18n';
import actions from 'src/modules/auth/authActions';
import selectors from 'src/modules/auth/authSelectors';
import yupFormSchemas from 'src/modules/shared/yup/yupFormSchemas';
import AuthField from 'src/view/auth/styles/AuthField';
import AuthSplitLayout from 'src/view/auth/styles/AuthSplitLayout';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import Message from 'src/view/shared/message';

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
  rememberMe: yupFormSchemas.boolean(
    i18n('user.fields.rememberMe'),
  ),
});

function SigninPage() {
  const location = useLocation();
  const dispatch = useDispatch();
  const loading = useSelector(selectors.selectLoading);
  const { socialErrorCode } = queryString.parse(
    location.search,
  );
  const externalErrorMessage = useSelector(
    selectors.selectErrorMessage,
  );
  const backgroundImageUrl = useSelector(
    selectors.selectBackgroundImageUrl,
  );
  const logoUrl = useSelector(selectors.selectLogoUrl);

  useEffect(() => {
    dispatch(actions.doClearErrorMessage());
  }, [dispatch]);

  useEffect(() => {
    if (socialErrorCode) {
      if (socialErrorCode === 'generic') {
        Message.error(i18n('errors.defaultErrorMessage'));
      } else {
        Message.error(
          i18n(`auth.social.errors.${socialErrorCode}`),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [initialValues] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });

  const form = useForm({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const onSubmit = ({ email, password, rememberMe }) => {
    dispatch(
      actions.doSigninWithEmailAndPassword(
        email,
        password,
        rememberMe,
      ),
    );
  };

  return (
    <AuthSplitLayout
      backgroundImageUrl={backgroundImageUrl || '/images/signin.jpg'}
      logoUrl={logoUrl}
      icon="fas fa-sign-in-alt"
      title={i18n('auth.layout.signinTitle')}
      subtitle={i18n('auth.layout.signinSubtitle')}
      footer={
        <>
          {i18n('auth.layout.noAccount')}
          <Link to="/auth/signup">{i18n('auth.createAnAccount')}</Link>
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
            autoComplete="current-password"
          />

          <div className="form-group form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id={'rememberMe'}
              name={'rememberMe'}
              ref={form.register}
            />
            <label className="form-check-label" htmlFor={'rememberMe'}>
              {i18n('user.fields.rememberMe')}
            </label>
          </div>

          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={loading}
          >
            <ButtonIcon loading={loading} />
            {i18n('auth.signin')}
            {!loading && <i className="fas fa-arrow-right ml-2" />}
          </button>
        </form>
      </FormProvider>
    </AuthSplitLayout>
  );
}

export default SigninPage;

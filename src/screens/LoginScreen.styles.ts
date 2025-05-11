import { StyleSheet } from 'react-native';
import { COLORS } from '../constants';

const styles = StyleSheet.create({
  biometricButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
    padding: 12,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonOpacity: {
    opacity: 0.8,
  },
  buttonOpacityDisabled: {
    opacity: 0.6,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    marginRight: 8,
    width: 20,
  },
  container: {
    flex: 1,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 24,
  },
  dividerText: {
    fontSize: 14,
    marginHorizontal: 16,
  },
  errorText: {
    color: COLORS.light.error,
    fontSize: 12,
    marginTop: 4,
  },
  eyeIcon: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  footerText: {
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  inputContainer: {
    gap: 8,
    marginBottom: 20,
  },
  inputWrapper: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    height: 54,
    paddingHorizontal: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputWrapperError: {
    borderColor: COLORS.light.error,
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loginButton: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 3,
    height: 54,
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  passwordStrengthBar: {
    backgroundColor: COLORS.gray,
    borderRadius: 2,
    height: 4,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthFill: {
    height: 4,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rememberMeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  rememberMeText: {
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  socialButton: {
    alignItems: 'center',
    borderRadius: 16,
    elevation: 3,
    height: 80,
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: 80,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default styles;

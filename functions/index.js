const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.alterarSenhaUsuario = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado.');
  }

  const { email, newPassword } = data;

  if (!email || !newPassword || newPassword.length < 6) {
    throw new functions.https.HttpsError('invalid-argument', 'E-mail e/ou senha inválidos. A senha deve ter no mínimo 6 caracteres.');
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password: newPassword });
    return { success: true };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new functions.https.HttpsError('not-found', 'Usuário com este e-mail não encontrado.');
    }
    throw new functions.https.HttpsError('internal', 'Erro ao alterar senha: ' + error.message);
  }
});

import { AuthService } from './authService';
import { InMemoryUserStore } from './auth/userStore';
import { InMemorySessionService } from './session/sessionManager';
import { Defender } from './defender';
import { AttackSimulator } from './attackSimulator';

async function main() {
  const defender = new Defender();
  const userStore = new InMemoryUserStore();
  const sessions = new InMemorySessionService();
  const auth = new AuthService({
    jwtSecret: 'test-secret',
    store: userStore,
    sessions,
  });

  const registered = await auth.register({
    name: 'Test User',
    email: 'test@example.com',
    password: 'SuperSecret123',
  });
  console.log('Registered user:', registered.user.email);

  const session = await auth.login({
    email: 'test@example.com',
    password: 'SuperSecret123',
  });
  console.log('Logged in user:', session.user.email);

  const simulator = new AttackSimulator(defender);
  await simulator.runSimulation(5);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
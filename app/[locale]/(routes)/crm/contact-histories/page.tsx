import MyContactHistoriesPage from './MyContactHistoriesPage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  return <MyContactHistoriesPage userId={userId} />;
} 
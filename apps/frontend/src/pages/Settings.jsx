import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../features/auth';

export function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Settings</h2>
        <p className="text-sm text-slate-500">Manage your profile information and preferences</p>
      </div>

      <Card className="space-y-4">
        <CardHeader>
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal profile details stored on CareerOS</CardDescription>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={user?.fullName || ''}
              key={user?.fullName}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              defaultValue={user?.email || ''}
              key={user?.email}
              disabled
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="sm">
            Save Changes
          </Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <CardHeader>
          <div>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Configure AI recommendations and notifications</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Email Notifications</p>
              <p className="text-xs text-slate-500">Receive weekly summaries of application updates</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded text-indigo-600 w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">AI Cover Letter Customization</p>
              <p className="text-xs text-slate-500">Allow automatic tailoring based on active resume</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded text-indigo-600 w-4 h-4" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Settings;

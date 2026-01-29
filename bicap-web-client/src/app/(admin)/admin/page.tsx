export default function AdminPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">System Administration</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">Total Users</h2>
                    <p className="text-2xl font-bold text-blue-600">150</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">System Status</h2>
                    <p className="text-2xl font-bold text-green-600">Healthy</p>
                </div>
            </div>
        </div>
    )
}

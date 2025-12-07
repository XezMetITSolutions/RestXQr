            ) : (
    <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white border">
            <thead className="bg-gray-100">
                <tr>
                    <th className="p-3 border text-left font-semibold">Name</th>
                    <th className="p-3 border text-left font-semibold">Ingredients (Raw Value)</th>
                    <th className="p-3 border text-left font-semibold">Ingredients Type</th>
                    <th className="p-3 border text-left font-semibold">Allergens (Raw Value)</th>
                    <th className="p-3 border text-left font-semibold">Allergens Type</th>
                </tr>
            </thead>
            <tbody>
                {menuItems.map((item: any) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 border">
                            {typeof item.name === 'object' ? (item.name?.tr || JSON.stringify(item.name)) : item.name}
                        </td>
                        <td className="p-3 border font-mono text-sm">
                            {JSON.stringify(item.ingredients)}
                        </td>
                        <td className="p-3 border">
                            <span className={`px-2 py-1 rounded text-xs text-white ${Array.isArray(item.ingredients) ? 'bg-green-500' : 'bg-red-500'}`}>
                                {Array.isArray(item.ingredients) ? 'Array' : typeof item.ingredients}
                            </span>
                        </td>
                        <td className="p-3 border font-mono text-sm">
                            {JSON.stringify(item.allergens)}
                        </td>
                        <td className="p-3 border">
                            <span className={`px-2 py-1 rounded text-xs text-white ${Array.isArray(item.allergens) ? 'bg-green-500' : 'bg-red-500'}`}>
                                {Array.isArray(item.allergens) ? 'Array' : typeof item.allergens}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)}
        </div >
    );
}

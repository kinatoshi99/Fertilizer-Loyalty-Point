import React from 'react';

const UltraAiTodo: React.FC = () => {
  const todos = [
    { id: 1, text: 'Learn about React', completed: true },
    { id: 2, text: 'Build a todo app', completed: false },
    { id: 3, text: 'Deploy the app', completed: false },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-slate-200/80 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Ultra AI Todo</h2>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className={`flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 ${todo.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-600 dark:text-slate-300'}`}>
            <span>{todo.text}</span>
            <input type="checkbox" checked={todo.completed} readOnly className="form-checkbox h-5 w-5 text-purple-600 rounded" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UltraAiTodo;

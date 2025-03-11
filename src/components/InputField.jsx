import React from 'react';

const InputField = ({
  id,
  type,
  value,
  onChange,
  error,
  label,
  placeholder,
  min,
  step,
}) => {
  return (
    <div className="flex flex-col">
		<label htmlFor={id} className="text-gray-700 font-medium mt-2">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`border p-2 rounded-md focus:border-[var(--primary-color)] ${error ? "border-red-500" : ""}`}
        placeholder={placeholder}
        min={min}
        step={step}
      />
      {error && <p className="text-red-500 text-sm mb-1">{error}</p>}
      
    </div>
  );
};

export default InputField;

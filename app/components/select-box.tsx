import { Space, Select } from "antd";
import { toTitleCase } from "../utils/string";
import { ReactNode } from "react";

export function SelectBox({ title, keys, titleCase = false, hint, onChange, children }:
    { title: string, keys: string[], titleCase?: boolean, hint?: string, onChange?: (data?: string) => void, children?: ReactNode }) {
    return (
        <Space vertical size={6} className="w-full">
            <p>{title}</p>
            <div className="flex gap-2 w-full">
                <Select
                    className="w-full"
                    placeholder={hint}
                    onChange={(input) => { if (onChange) { onChange(input) } }}
                    showSearch
                    allowClear
                    options={keys.map((key) => ({ value: key, label: titleCase ? toTitleCase(key) : key }))}
                />
                {children}
            </div>
        </Space>
    );
}

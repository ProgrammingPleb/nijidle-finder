"use client";

import { useState } from "react";
import { Button, Card, Form, InputNumber, Select, Space } from "antd";
import { Liver, relatedSpecies, uniqueValues } from "./model/nijisanji";

type DebutGuess = "above" | "below" | "exact";

interface DebutValue {
    year: number;
    guess: DebutGuess;
}

interface FormValues {
    debut?: DebutValue;
    gender?: string;
    species?: string[];
    color?: string;
}

export function LiverSearch({ livers }: { livers: Liver[] }) {
    const [liverResults, setLiverResults] = useState<Liver[]>([]);

    function onSearch(formValues: FormValues) {
        console.log(formValues);
        const possibleLivers: Liver[] = [];

        if (formValues.debut == undefined && formValues.gender == undefined &&
            formValues.species == undefined && formValues.color == undefined) {
                setLiverResults([]);
                return;
        }

        for (const liver of livers) {
            if (formValues.debut != undefined && !matchesDebutGuess(liver.debut, formValues.debut)) {
                continue;
            }
            if (formValues.gender != undefined && liver.gender != formValues.gender) {
                continue;
            }
            if (formValues.species != undefined && !formValues.species.includes(liver.species)) {
                continue;
            }
            if (formValues.color != undefined && formValues.color != liver.color_group) {
                continue;
            }
            possibleLivers.push(liver);
        }

        setLiverResults(possibleLivers);
    }

    return (
        <div className="w-full grow lg:min-h-0 flex max-lg:flex-col justify-center max-lg:items-center gap-8">
            <Card title="Search Filters" className="w-full h-fit md:max-w-lg">
                <Form onFinish={onSearch}>
                    <Space vertical size={4} className="w-full">
                        <Form.Item
                            name="debut"
                        >
                            <DebutBox />
                        </Form.Item>
                        <Form.Item
                            name="gender"
                        >
                            <SelectBox title="Gender" keys={uniqueValues(livers, "gender")} />
                        </Form.Item>
                        <Form.Item
                            name="species"
                        >
                            <SpeciesBox keys={uniqueValues(livers, "species")} />
                        </Form.Item>
                        <Form.Item
                            name="color"
                        >
                            <SelectBox title="Color" keys={uniqueValues(livers, "color_group")} titleCase />
                        </Form.Item>
                        <Form.Item label={null}>
                            <Button type="primary" htmlType="submit">
                                Search
                            </Button>
                        </Form.Item>
                    </Space>
                </Form>
            </Card>
            <SearchResults results={liverResults} />
        </div>
    );
}

function SearchResults({ results }: { results: Liver[] }) {
    return (
        <Card
            title="Possible Livers"
            className="w-full h-fit md:max-w-lg lg:max-h-full lg:flex lg:flex-col"
            classNames={{ body: "lg:flex-1 lg:min-h-0 lg:overflow-y-auto" }}
        >
            <Space vertical size={16} className="w-full">
                {
                    results.length < 1 &&
                    <p>No search filters active yet.</p>
                }
                {
                    results.map((liver) => {
                        return (
                            <Card key={liver.name} title={liver.name} className="w-full">
                                <div className="flex gap-1">
                                    <p className="font-bold">Debut Year:</p>
                                    <p>{liver.debut}</p>
                                </div>
                                <div className="flex gap-1">
                                    <p className="font-bold">Gender:</p>
                                    <p>{liver.gender}</p>
                                </div>
                                <div className="flex gap-1">
                                    <p className="font-bold">Species:</p>
                                    <p>{liver.species}</p>
                                </div>
                                <div className="flex gap-1">
                                    <p className="font-bold">Color:</p>
                                    <p className="capitalize">{liver.color_group}</p>
                                    <div className="flex items-center gap-0.5">
                                        <p>(</p>
                                        <div style={{ backgroundColor: liver.color_hex }} className="w-2.5 h-2.5 mt-0.75" />
                                        <p>{liver.color_hex}</p>
                                        <p>)</p>
                                    </div>
                                </div>
                            </Card>
                        )
                    })
                }
            </Space>
        </Card>
    )
}

function SelectBox({ title, keys, titleCase = false, hint, onChange }:
    { title: string, keys: string[], titleCase?: boolean, hint?: string, onChange?: (data: string) => void }) {
    return (
        <Space vertical size={6} className="w-full">
            <p>{title}</p>
            <Select
                className="w-full"
                placeholder={hint}
                onChange={(input) => { if (onChange) { onChange(input) } }}
                showSearch
                allowClear
                options={keys.map((key) => ({ value: key, label: titleCase ? toTitleCase(key) : key }))}
            />
        </Space>
    );
}

function DebutBox({ onChange }: { onChange?: (data: DebutValue | undefined) => void }) {
    const [guess, setGuess] = useState<DebutGuess>("exact");
    const [year, setYear] = useState<number | null>(null);

    const emit = (nextGuess: DebutGuess, nextYear: number | null) => {
        onChange?.(nextYear === null ? undefined : { year: nextYear, guess: nextGuess });
    };

    const toggle = (button: DebutGuess) => {
        const next = guess === button ? "exact" : button;
        setGuess(next);
        emit(next, year);
    };

    return (
        <Space vertical size={6} className="w-full">
            <p>Debut</p>
            <div className="flex gap-2 w-full">
                <Space.Compact>
                    <Button type={guess === "above" ? "primary" : "default"} onClick={() => toggle("above")}>
                        Above
                    </Button>
                    <Button type={guess === "below" ? "primary" : "default"} onClick={() => toggle("below")}>
                        Below
                    </Button>
                </Space.Compact>
                <InputNumber
                    className="flex-1"
                    placeholder="Debut Year"
                    value={year}
                    onChange={(input) => {
                        setYear(input);
                        emit(guess, input);
                    }}
                />
            </div>
        </Space>
    );
}

function SpeciesBox({ keys, onChange }: { keys: string[], onChange?: (data: string[] | undefined) => void }) {
    return (
        <Space vertical size={6} className="w-full">
            <p>Species</p>
            <Select
                className="w-full"
                onChange={(input) => { if (onChange) { onChange(input ? relatedSpecies(input, keys) : undefined) } }}
                showSearch={{
                    filterOption: (input, option) => relatedSpecies(input, [option!.value]).length > 0
                }}
                options={keys.map((key) => ({ value: key, label: key }))}
                allowClear
            />
        </Space>
    );
}

function matchesDebutGuess(matchingYear: number, value: DebutValue) {
    if (value.guess == "above" && matchingYear > value.year) {
        return true;
    }
    if (value.guess == "below" && matchingYear < value.year) {
        return true;
    }
    if (value.guess == "exact" && matchingYear == value.year) {
        return true;
    }
    return false;
}

const toTitleCase = (str: string) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

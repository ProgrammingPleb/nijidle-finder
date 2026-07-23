"use client";

import { useRef, useState } from "react";
import { Button, Card, Form, InputNumber, Select, Space } from "antd";
import { Liver, relatedSpecies, uniqueValues } from "./model/nijisanji";
import { SelectBox } from "./components/select-box";

const COLORS = ["red", "orange", "cream", "yellow", "green", "teal", "blue", "purple", "magenta", "pink"];

type DebutGuess = "above" | "below" | "exact";

interface DebutValue {
    year: number;
    guess: DebutGuess;
}

interface FormValues {
    debut?: DebutValue;
    gender?: string[];
    species?: string[];
    color?: string[];
}

export function LiverSearch({ livers }: { livers: Liver[] }) {
    const [form] = Form.useForm<FormValues>();
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
            if (formValues.gender != undefined && !formValues.gender.includes(liver.gender)) {
                continue;
            }
            if (formValues.species != undefined && !formValues.species.includes(liver.species)) {
                continue;
            }
            if (formValues.color != undefined && !formValues.color.includes(liver.color_group)) {
                continue;
            }
            possibleLivers.push(liver);
        }

        setLiverResults(possibleLivers);
    }

    return (
        <div className="w-full grow lg:min-h-0 flex max-lg:flex-col justify-center max-lg:items-center gap-8">
            <Card title="Search Filters" className="w-full h-fit md:max-w-lg">
                <Form form={form} onFinish={onSearch}>
                    <Space vertical size={4} className="w-full">
                        <Form.Item
                            name="debut"
                        >
                            <DebutBox />
                        </Form.Item>
                        <Form.Item
                            name="gender"
                        >
                            <GenderBox keys={uniqueValues(livers, "gender")} />
                        </Form.Item>
                        <Form.Item
                            name="species"
                        >
                            <SpeciesBox keys={uniqueValues(livers, "species")} />
                        </Form.Item>
                        <Form.Item
                            name="color"
                        >
                            <ColorBox />
                        </Form.Item>
                        <div className="flex gap-2 w-full">
                            <Form.Item label={null}>
                                <Button type="primary" htmlType="submit">
                                    Search
                                </Button>
                            </Form.Item>
                            <Button type="default" onClick={() => { form.resetFields(); setLiverResults([]); }}>
                                Clear
                            </Button>
                        </div>
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

function GenderBox({ keys, onChange }: { keys: string[], onChange?: (data?: string[]) => void }) {
    const gender = useRef<string>(undefined);
    const [opposite, setOpposite] = useState(false);

    function emit(nextGender: string | undefined, nextOpposite: boolean) {
        onChange?.(nextGender ? nextOpposite ? keys.filter((gender) => gender != nextGender) : [nextGender] : undefined);
    }

    return (
        <SelectBox title="Gender" keys={keys}
            onChange={(value) => {
                gender.current = value;
                emit(value, opposite);
            }}
            titleCase
        >
            <Button type={opposite ? "primary" : "default"}
                onClick={() => {
                    const newGuess = !opposite;
                    setOpposite(newGuess);
                    emit(gender.current, newGuess);
                }}
            >
                Opposite
            </Button>
        </SelectBox>

    )
}

function ColorBox({ onChange }: { onChange?: (data?: string[]) => void }) {
    const [color, setColor] = useState<string>();
    const [nearColor, setNearColor] = useState(false);

    function emit(nextColor: string | undefined, nextIsNear: boolean) {
        onChange?.(nextColor ? nextIsNear ? getNeighbouringColors(nextColor) : [nextColor] : undefined);
    }

    return (
        <SelectBox title="Color" keys={COLORS}
            onChange={(color) => {
                if (color === "white") setNearColor(false);
                setColor(color);
                emit(color, color !== "white" ? nearColor : false);
            }}
            titleCase
        >
            <Button type={nearColor ? "primary" : "default"}
                onClick={() => {
                    const newGuess = !nearColor;
                    setNearColor(newGuess);
                    emit(color, newGuess);
                }}
                disabled={color === "white"}
            >
                Neighbouring
            </Button>
        </SelectBox>

    )
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

function SpeciesBox({ keys, onChange }: { keys: string[], onChange?: (data?: string[]) => void }) {
    const species = useRef<string>(undefined);
    const [isExact, setIsExact] = useState(false);

    function emit(nextSpecies: string | undefined, nextIsExact: boolean) {
        const speciesData = nextSpecies ? nextIsExact ? [nextSpecies] : relatedSpecies(nextSpecies, keys) : undefined;
        onChange?.(speciesData ? speciesData : undefined);
    }

    return (
        <Space vertical size={6} className="w-full">
            <p>Species</p>
            <div className="flex gap-2 w-full">
                <Select
                    className="flex-1"
                    onChange={(input) => {
                        species.current == input;
                        emit(input, isExact);
                    }}
                    showSearch={{
                        filterOption: (input, option) => relatedSpecies(input, [option!.value]).length > 0
                    }}
                    options={keys.map((key) => ({ value: key, label: key }))}
                    allowClear
                />
                <Button type={isExact ? "primary" : "default"}
                    onClick={() => {
                        const newGuess = !isExact;
                        setIsExact(newGuess);
                        emit(species.current, newGuess);
                    }}
                >
                    Exact
                </Button>
            </div>
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

function getNeighbouringColors(color: string) {
    const index = COLORS.findIndex((value) => {
        return value == color;
    });

    const before = index > 0 ? COLORS[index - 1] : COLORS[COLORS.length - 1];
    const after = index < COLORS.length - 1 ? COLORS[index + 1] : COLORS[0];
    return [before, after];
}

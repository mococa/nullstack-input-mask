import Nullstack, { InputHTMLAttributes, NullstackClientContext } from "nullstack";

interface BaseProps {
    name: string;
    placeholder: string;
    type: InputHTMLAttributes<HTMLInputElement>["type"];
    bind: InputHTMLAttributes<HTMLInputElement>["bind"];
    required: InputHTMLAttributes<HTMLInputElement>["required"];
    class: InputHTMLAttributes<HTMLInputElement>["class"];
    style: InputHTMLAttributes<HTMLInputElement>["style"];
    min: InputHTMLAttributes<HTMLInputElement>["min"];
    minlength: InputHTMLAttributes<HTMLInputElement>["minlength"];
    max: InputHTMLAttributes<HTMLInputElement>["max"];
    maxlength: InputHTMLAttributes<HTMLInputElement>["maxlength"];
    disabled: InputHTMLAttributes<HTMLInputElement>["disabled"];
    debounce: InputHTMLAttributes<HTMLInputElement>["debounce"];
    pattern: InputHTMLAttributes<HTMLInputElement>["pattern"];
    title: InputHTMLAttributes<HTMLInputElement>["title"];
    spellcheck: InputHTMLAttributes<HTMLInputElement>["spellcheck"];
    autocomplete: InputHTMLAttributes<HTMLInputElement>["autocomplete"];
    autofocus: InputHTMLAttributes<HTMLInputElement>["autofocus"];
}

/**
 * @description
 * Masked input component properties
 */
export interface InputMaskProps extends Partial<BaseProps> {
    /**
     * @description
     * Property to be bound to the input masked value
     * 
     * @example
     * bind={this.phone}
     */
    bind: InputHTMLAttributes<HTMLInputElement>["bind"];

    /**
     * @description
     * Mask pattern
     *
     * @example
     * "(___) _ ____-____"
     */
    mask: string;

    /**
     * @description
     * Mask character pattern replacement
     *
     * @example
     * { _: /\d/ }
     */
    replacement: Record<string, RegExp>;

    /**
     * @description
     * Default value for the input
     */
    defaultvalue: string;

    /**
     * @description
     * Callback function that receives the masked value
     * 
     * @param value Masked value
     * @returns Masked value
     */
    onmasked?: (value: string) => void;

    /**
     * @description
     * Allow characters that don't match the mask pattern to be input?
     */
    allowunmatches?: boolean
}

/**
 * @description
 * Masked input component for Nullstack
 * 
 * @example
 * <NullstackInputMask mask="+55 (__) _ ____-____" replacement={{ _: /\d/ }} bind={this.phone} />
 * <NullstackInputMask mask="ddd.ddd.ddd-dd" replacement={{ _: /\d/ }} bind={this.cpf} />
 * 
 * @returns
 * Stateful component that masks the input value based on the mask pattern
 */
export class InputMask extends Nullstack<InputMaskProps> {
    value: string;

    prepare({ defaultvalue, mask, replacement }: Partial<InputMaskProps>) {
        this.value = applyMask(defaultvalue || "", mask, replacement);
    }

    render({
        children,
        style,
        class: className,
        mask,
        replacement,
        defaultvalue,
        bind,
        onmasked,
        allowunmatches,
        ...props
    }: NullstackClientContext<InputMaskProps>) {
        if (!mask) throw new Error("The mask attribute is required for the NullstackInputMask component");
        if (!bind) throw new Error("The bind attribute is required for the NullstackInputMask component");

        const { property, object } = bind;

        object[property] = this.value;

        return (
            <input
                {...props}
                class={["nullstack-input-mask", className].flat().filter(Boolean).join(" ")}
                data-mask={mask}
                value={this.value}
                oninput={({ event }) => {
                    const input: HTMLInputElement = event.currentTarget;

                    if (!allowunmatches) {
                        // Not processing if the input doesn't match the mask pattern
                        const forbidden = mask.split("").some((char, index) => {
                            const inputChar = input.value[index];
                            if (!inputChar) return false;

                            const regex = new RegExp(replacement[char], "g");
                            if (!regex) return false;

                            return !regex.test(inputChar);
                        });

                        if (forbidden) return input.value = this.value;
                    }

                    this.value = applyMask(input.value, mask, replacement);
                    object[property] = this.value;
                    if (onmasked) onmasked(input.value);
                    this.value = object[property];
                }}
            />
        );
    }
}

/**
 * @description
 * Gets the masked value from the raw input value
 *
 * @param value Raw input value
 * @param mask Mask pattern
 * @param replacement Mask character pattern replacement
 * @returns Masked value
 */
export function applyMask(value: string, mask: string, replacement: Record<string, RegExp>) {
    let maskedValue = "";
    let rawIndex = 0;

    for (let i = 0; i < mask.length; i++) {
        const maskChar = mask[i];

        // If the mask character exists in the replacement map, process the input
        if (replacement[maskChar]) {
            const inputChar = value[rawIndex];

            // Validate input character against the pattern
            if (replacement[maskChar].test(inputChar)) {
                maskedValue += inputChar;
                rawIndex++;
            } else {
                // Stop processing if the input doesn't match the expected pattern
                break;
            }
        } else {
            // Add static mask character to the result
            maskedValue += maskChar;

            // Skip over mask character in input if it matches
            if (value[rawIndex] === maskChar) {
                rawIndex++;
            }
        }

        // Stop if we've processed all input characters
        if (rawIndex >= value.length) {
            break;
        }
    }

    return maskedValue;
}

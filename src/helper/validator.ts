import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function validate<
    P extends object,
    T extends z.ZodObject<
        P extends z.ZodRawShape ? P : {},
        "strip",
        z.ZodTypeAny,
        P,
        P
    >
>(data: P, Schema: T) {
    const result = await Schema.safeParseAsync(data);
    if (result.success)
        return {
            success: result.success,
            data: result.data as z.infer<typeof Schema>,
        };
    const error = fromZodError(result.error, {
        issueSeparator: " | ",
        maxIssuesInMessage: 1,
    });
    return {
        success: result.success,
        message: error.message.replace("Validation e", "E"),
    };
}

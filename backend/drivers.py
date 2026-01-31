from typing import List

def get_python_driver(user_code: str) -> str:
    return f"""
import sys
import ast

# User Code
{user_code}

if __name__ == "__main__":
    try:
        input_str = sys.stdin.read()
        lines = [line for line in input_str.strip().split('\\n') if line.strip()]
        args = [ast.literal_eval(line) for line in lines]
        
        sol = Solution()
        # Find method
        method_name = [func for func in dir(sol) if callable(getattr(sol, func)) and not func.startswith("__")][0]
        method = getattr(sol, method_name)
        
        result = method(*args)
        print(result)
    except Exception as e:
        print(f"Driver Error: {{e}}")
        # print(f"Raw Input: {{input_str!r}}")
"""

def get_java_driver(user_code: str) -> str:
    # Java Driver needs to be more robust. 
    # For now, it assumes the Solution class is provided.
    # It wraps everything in a Main class.
    # We allow imports in user code? Piston java execution usually expects Main class.
    
    # We will try to append the User's Solution class OUTSIDE the Main class, 
    # but in the same file. Java allows non-public classes in the same file.
    
    return f"""
import java.util.*;
import java.io.*;
import java.util.stream.*;

@SuppressWarnings("unchecked")
public class Main {{
    public static void main(String[] args) {{
        try {{
            Scanner scanner = new Scanner(System.in);
            if (!scanner.hasNext()) return;
            String inputAll = scanner.useDelimiter("\\\\A").next();
            String[] lines = inputAll.trim().split("\\\\n");
            
            // ARGUMENT PARSING LOGIC
            // This is specific to our "twoSum" example layout for now.
            // Ideally this should be dynamic based on problem signature, but Java reflection 
            // with dynamic arguments from string is hard without strict typing.
            // For this MVP, we will try to infer types or just parse standard JSON-like arrays.
            
            Object[] parsedArgs = new Object[lines.length];
            for (int i = 0; i < lines.length; i++) {{
                String line = lines[i].trim();
                parsedArgs[i] = parseArgument(line);
            }}

            Solution sol = new Solution();
            // Reflection to find the first method in Solution that is not wait/notify/etc
            java.lang.reflect.Method[] methods = Solution.class.getDeclaredMethods();
            java.lang.reflect.Method targetMethod = null;
            for (java.lang.reflect.Method m : methods) {{
                if (m.getModifiers() == java.lang.reflect.Modifier.PUBLIC) {{
                     targetMethod = m;
                     break;
                }}
            }}
            
            if (targetMethod != null) {{
                // We need to convert our generic Objects to the specific types the method expects
                Class<?>[] paramTypes = targetMethod.getParameterTypes();
                Object[] finalArgs = new Object[parsedArgs.length];
                
                for(int j=0; j<parsedArgs.length; j++) {{
                    finalArgs[j] = convertObject(parsedArgs[j], paramTypes[j]);
                }}
                
                Object result = targetMethod.invoke(sol, finalArgs);
                
                // Format result (arrays need deepToString)
                if (result != null && result.getClass().isArray()) {{
                    if (result instanceof int[]) System.out.println(Arrays.toString((int[])result));
                    else if (result instanceof Object[]) System.out.println(Arrays.deepToString((Object[])result));
                    else System.out.println(result); // other primitives
                }} else {{
                    System.out.println(result);
                }}
            }} else {{
                System.out.println("Error: No public method found in Solution class.");
            }}
            
        }} catch (Exception e) {{
            e.printStackTrace();
        }}
    }}

    // Simple parser for [1,2,3] or 123
    private static Object parseArgument(String s) {{
        s = s.trim();
        if (s.startsWith("[")) {{
            // Array - simplified for int[] for now
            s = s.substring(1, s.length() - 1); // remove []
            if (s.isEmpty()) return new ArrayList<Integer>();
            String[] parts = s.split(",");
            List<Integer> list = new ArrayList<>();
            for (String p : parts) {{
                try {{
                    list.add(Integer.parseInt(p.trim()));
                }} catch (NumberFormatException e) {{
                    // ignore or handle strings later
                }}
            }}
            return list;
        }} else {{
            // Integer
            try {{
                return Integer.parseInt(s);
            }} catch (NumberFormatException e) {{
                if (s.length() >= 2 && s.startsWith(\"\\\"\") && s.endsWith(\"\\\"\")) {{
                    s = s.substring(1, s.length() - 1);
                }}
                return s;
            }}
        }}
    }}
    
    // Converter to match method signature
    @SuppressWarnings("unchecked")
    private static Object convertObject(Object obj, Class<?> targetType) {{
        if (targetType == int[].class && obj instanceof List) {{
            List<Integer> list = (List<Integer>) obj;
            int[] arr = new int[list.size()];
            for(int i=0; i<list.size(); i++) arr[i] = list.get(i);
            return arr;
        }}
        if (targetType == int.class && obj instanceof Integer) {{
            return obj;
        }}
        // Add more conversions as needed (String, etc)
        return obj;
    }}
}}

// User Code
{user_code}
"""

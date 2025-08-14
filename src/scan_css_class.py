import json
import re
from pathlib import Path


def extract_classes_from_html(html_file):
    """提取html文件中出现的所有class类名"""
    class_regex = re.compile(r'class\s*=\s*["\']([^"\']+)["\']')
    class_names = set()
    with open(html_file, "r", encoding="utf-8") as f:
        content = f.read()
        for match in class_regex.finditer(content):
            classlist = match.group(1).split()
            class_names.update(classlist)
    return class_names

def extract_classes_from_css(css_file):
    """提取css文件中定义过的所有class名（包括媒体查询内的类名）"""
    class_names = set()
    with open(css_file, "r", encoding="utf-8") as f:
        content = f.read()

        # 移除注释以避免干扰
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

        # 匹配所有CSS选择器中的类名，包括媒体查询内的
        # - 允许 Tailwind 中常见的转义字符（\:、\/、\., \%, \#, \[,\] 等）
        # - 在复杂选择器中，也能抓到像 ".group:hover .group-hover\:opacity-100" 里的 ".group-hover\:opacity-100"
        css_regex = re.compile(
            r'\.([a-zA-Z0-9_\-\\/:%\.#\[\]]+)(?=\s*[{,>+~\s]|$)',
            re.MULTILINE
        )

        for match in css_regex.finditer(content):
            raw_cls = match.group(1)

            # 仅移除“未转义”的结尾伪类/伪元素（如 :hover, ::before, :is(...), :where(...)）
            # 注意：Tailwind 变体类名中的冒号是转义的（例如 \:），不应被移除
            cleaned_cls = re.sub(
                r'(?<!\\)::?[a-zA-Z0-9_-]+(?:\([^)]+\))?$',
                '',
                raw_cls
            )

            # 反转义 Tailwind CSS 的转义字符
            unescaped_cls = tailwind_unescape(cleaned_cls)

            if unescaped_cls:  # 确保不是空字符串
                class_names.add(unescaped_cls)

    return class_names

def tailwind_unescape(classname):
    """对 Tailwind CSS 的转义字符进行反转义"""
    return (
        classname.replace('\\/', '/')
        .replace('\\:', ':')
        .replace('\\.', '.')
        .replace('\\%', '%')
        .replace('\\#', '#')
        .replace('\\[', '[')
        .replace('\\]', ']')
        .replace('\\\\', '\\')
    )

def main():
    script_dir = Path(__file__).resolve().parent
    html_dir = script_dir / "../luasrc/view/themes/orion"
    html_dir = html_dir.resolve()
    html_files = [html_dir / "footer.htm", html_dir / "header.htm", html_dir / "sysauth.htm"]

    css_file = script_dir / "../htdocs/luci-static/orion/orion.css"

    all_html_classes = set()
    html_class_map = {}
    for html_file in html_files:
        if html_file.exists():
            html_classes = extract_classes_from_html(html_file)
            html_class_map[html_file.name] = sorted(html_classes)
            all_html_classes.update(html_classes)
        else:
            html_class_map[html_file.name] = None

    if not css_file.exists():
        print(f"Error: CSS file not found at {css_file}")
        return

    css_classes = extract_classes_from_css(css_file)

    result = {
        "html_files": html_class_map,
        "not_defined": [],
        "css_file": str(css_file)
    }

    for cls in sorted(all_html_classes):
        if cls not in css_classes:
            result["not_defined"].append(cls)

    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
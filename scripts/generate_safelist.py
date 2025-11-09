#!/usr/bin/env python3
"""
Tailwind CSS Safelist 生成工具

作用：
    扫描所有 ucode 模板文件 (*.ut) 中使用的 Tailwind CSS 类名，
    生成并集输出为 safelist 数组格式，可直接复制到 tailwind.config.js

用法：
    python scripts/generate_safelist.py

输出格式：
    safelist: [
        'class-name-1',
        'class-name-2',
        ...
    ]
"""

import re
from pathlib import Path


def is_valid_tailwind_class(class_name):
    """判断是否为有效的 Tailwind CSS 类名"""
    # 过滤掉明显不是类名的内容
    invalid_patterns = [
        r'^[!=<>]+$',           # 逻辑运算符: !=, ==, <, >
        r'^\{[%{]',             # ucode 模板语法: {%, {{
        r'^if$|^else$|^endif$', # 模板关键字
        r'^\([^)]*$',           # 不完整的括号
        r'^lang_$',             # 不完整的前缀
        r'^\s*$',               # 空白
    ]
    
    for pattern in invalid_patterns:
        if re.match(pattern, class_name):
            return False
    
    # Tailwind 类名必须包含字母或数字
    if not re.search(r'[a-zA-Z0-9]', class_name):
        return False
    
    # Tailwind 类名应该以字母、数字或某些特殊字符开头
    # 允许的格式：text-sm, -translate-x-1/2, hover:text-white, w-1/2, !important
    if not re.match(r'^[a-zA-Z0-9!-]', class_name):
        return False
    
    return True


def extract_classes_from_template(template_file):
    """提取 ucode 模板文件中的所有 CSS 类名

    支持格式：
    - class="foo bar baz"
    - class='foo bar'
    - class="{{ var }} foo"  (移除变量插值)
    - classList.add('foo')
    - classList.remove('foo')
    - classList.toggle('foo')
    """
    class_names = set()

    try:
        with open(template_file, "r", encoding="utf-8") as f:
            content = f.read()

            # 匹配 HTML class 属性
            class_regex = re.compile(r'class\s*=\s*["\']([^"\']*)["\']')
            for match in class_regex.finditer(content):
                class_str = match.group(1)
                # 移除 ucode 模板变量插值
                class_str = re.sub(r'\{\{[^}]+\}\}', ' ', class_str)
                class_str = re.sub(r'\{%[^%]+%\}', ' ', class_str)
                classes = class_str.split()
                # 过滤有效的类名
                valid_classes = [cls for cls in classes if is_valid_tailwind_class(cls)]
                class_names.update(valid_classes)

            # 匹配 JavaScript classList 操作
            js_class_regex = re.compile(r'classList\.(add|remove|toggle)\(["\']([^"\']+)["\']\)')
            for match in js_class_regex.finditer(content):
                classes = match.group(2).split()
                valid_classes = [cls for cls in classes if is_valid_tailwind_class(cls)]
                class_names.update(valid_classes)

    except Exception as e:
        import sys
        print(f"# Error processing {template_file}: {e}", file=sys.stderr)

    return class_names


def format_safelist(class_names):
    """格式化为 tailwind.config.js safelist 数组格式"""
    sorted_classes = sorted(class_names)

    if not sorted_classes:
        return "safelist: []"

    # 格式化为多行数组，每个类名单独一行
    lines = ["safelist: ["]
    for cls in sorted_classes:
        lines.append(f"    '{cls}',")
    lines.append("]")

    return '\n'.join(lines)


def main():
    script_dir = Path(__file__).resolve().parent
    project_dir = script_dir.parent

    # ucode 模板目录
    template_dir = project_dir / "ucode/template/themes/orion"

    if not template_dir.exists():
        import sys
        print(f"# Error: Template directory not found at {template_dir}", file=sys.stderr)
        return

    # 查找所有 .ut 文件
    template_files = list(template_dir.glob("*.ut"))

    if not template_files:
        import sys
        print(f"# Warning: No .ut template files found in {template_dir}", file=sys.stderr)
        return

    # 收集所有类名的并集
    all_classes = set()

    for template_file in template_files:
        classes = extract_classes_from_template(template_file)
        all_classes.update(classes)

    # 输出 safelist 格式
    print(format_safelist(all_classes))

    # 输出统计信息到 stderr
    import sys
    print(f"\n# Statistics:", file=sys.stderr)
    print(f"#   Template files scanned: {len(template_files)}", file=sys.stderr)
    print(f"#   Total unique classes: {len(all_classes)}", file=sys.stderr)
    print(f"#", file=sys.stderr)
    print(f"# Copy the safelist array above to your tailwind.config.js", file=sys.stderr)


if __name__ == "__main__":
    main()

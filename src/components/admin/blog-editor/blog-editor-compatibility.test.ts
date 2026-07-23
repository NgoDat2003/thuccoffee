import { Editor } from '@tiptap/core';
import { describe, expect, it } from 'vitest';

import { blogContentBySlug } from '../../../data/blog-content';
import { createBlogEditorExtensions } from './blog-editor-extensions';
import {
  classifyBlogHtmlForVisual,
  compareBlogHtmlStructure,
} from './blog-editor-compatibility';

function roundTrip(html: string): string {
  const editor = new Editor({
    extensions: createBlogEditorExtensions(),
    content: html,
  });
  const result = editor.getHTML();
  editor.destroy();
  return result;
}

describe('blog editor compatibility', () => {
  it('keeps simple authoring content visual-compatible', () => {
    const html = '<h2>Tiêu đề</h2><p>Xin <strong>chào</strong>.</p><ul><li><p>Một</p></li><li><p>Hai</p></li></ul>';
    expect(classifyBlogHtmlForVisual(html).mode).toBe('visual');
    expect(compareBlogHtmlStructure(html, roundTrip(html)).mode).toBe('visual');
  });

  it('keeps blog-asset marker and image order through Tiptap', () => {
    const html = '<p>Ảnh:</p><img src="blog-asset:blog/a.png" alt="A"><img src="https://example.com/b.png" alt="B">';
    const result = roundTrip(html);
    expect(result).toContain('src="blog-asset:blog/a.png"');
    expect(result.indexOf('blog/a.png')).toBeLessThan(result.indexOf('example.com/b.png'));
    expect(compareBlogHtmlStructure(html, result).mode).toBe('visual');
  });

  it('forces styled legacy wrappers and table attributes to source-only', () => {
    expect(classifyBlogHtmlForVisual('<div style="text-align:center"><span>Legacy</span></div>').mode).toBe('source-only');
    expect(classifyBlogHtmlForVisual('<table border="1"><tbody><tr><td rowspan="2">A</td></tr></tbody></table>').mode).toBe('source-only');
  });

  it('detects silent structural loss', () => {
    expect(compareBlogHtmlStructure('<p dir="ltr">A</p>', '<p>A</p>').mode).toBe('source-only');
  });

  it('keeps table cells but excludes unsupported table headers', () => {
    const editor = new Editor({
      extensions: createBlogEditorExtensions(),
      content: '<table><tbody><tr><td>A</td></tr></tbody></table>',
    });
    expect(editor.schema.nodes.tableHeader).toBeUndefined();
    expect(editor.schema.nodes.tableCell).toBeDefined();
    expect(editor.getHTML()).toContain('<td');
    editor.destroy();
  });
  it('classifies all 267 current posts without silent visual loss', () => {
    const entries = Object.entries(blogContentBySlug);
    expect(entries).toHaveLength(267);
    let visual = 0;
    let sourceOnly = 0;
    const reasonCounts = new Map<string, number>();
    for (const [slug, html] of entries) {
      const compatibility = classifyBlogHtmlForVisual(html);
      if (compatibility.mode === 'source-only') {
        sourceOnly += 1;
        for (const reason of compatibility.reasons) reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
        continue;
      }
      visual += 1;
      const roundTripped = roundTrip(html);
      const comparison = compareBlogHtmlStructure(html, roundTripped);
      if (comparison.mode === 'source-only') console.info({ slug, html, roundTripped, comparison });
      expect(comparison, slug).toMatchObject({ mode: 'visual' });
    }
    expect(visual + sourceOnly).toBe(267);
    console.info(`Blog editor corpus: ${visual} visual, ${sourceOnly} source-only.`, Object.fromEntries(reasonCounts));
  });
});

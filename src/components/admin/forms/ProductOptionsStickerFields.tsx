import {
  useAdminProductOptions,
  useAdminStickers,
} from '../../../services/admin/stickers.service';

export interface OptionLinkDraft {
  optionId: number;
  price: string;
}

interface ProductOptionsStickerFieldsProps {
  optionLinks: OptionLinkDraft[];
  stickerIds: number[];
  onOptionLinksChange: (links: OptionLinkDraft[]) => void;
  onToggleSticker: (id: number) => void;
}

// Section Options + Stickers của form sản phẩm: gắn lựa chọn phục vụ có giá
// riêng và badge hiển thị trên card.
export default function ProductOptionsStickerFields({
  optionLinks,
  stickerIds,
  onOptionLinksChange,
  onToggleSticker,
}: ProductOptionsStickerFieldsProps) {
  const options = useAdminProductOptions();
  const stickers = useAdminStickers();

  const toggleOption = (optionId: number) => {
    const existing = optionLinks.find((link) => link.optionId === optionId);
    onOptionLinksChange(existing
      ? optionLinks.filter((link) => link.optionId !== optionId)
      : [...optionLinks, { optionId, price: '0' }]);
  };

  const setOptionPrice = (optionId: number, price: string) => {
    onOptionLinksChange(optionLinks.map((link) =>
      link.optionId === optionId ? { ...link, price } : link,
    ));
  };

  return (
    <>
      <fieldset>
        <legend className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted-2">Lựa chọn phục vụ (giá theo lựa chọn)</legend>
        {options.isPending ? <p className="text-[13px] text-admin-muted">Đang tải options…</p> : (
          <div className="flex flex-col gap-2">
            {(options.data ?? []).map((option) => {
              const link = optionLinks.find((item) => item.optionId === option.id);
              return (
                <div key={option.id} className="flex flex-wrap items-center gap-3">
                  <label className="flex min-w-[160px] items-center gap-2.5 text-[13.5px] text-admin-ink-soft">
                    <input type="checkbox" checked={Boolean(link)} onChange={() => toggleOption(option.id)} />
                    {option.name}
                  </label>
                  {link && (
                    <label className="flex items-center gap-2 text-[13px] text-admin-muted">
                      Giá (đ)
                      <input
                        type="number"
                        min="0"
                        value={link.price}
                        onChange={(event) => setOptionPrice(option.id, event.target.value)}
                        className="w-28"
                        aria-label={`Giá cho ${option.name}`}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted-2">Sticker</legend>
        {stickers.isPending ? <p className="text-[13px] text-admin-muted">Đang tải sticker…</p>
          : (stickers.data ?? []).length === 0 ? <p className="text-[13px] text-admin-muted">Chưa có sticker nào. Tạo trong mục quản lý sticker.</p>
          : (
            <div className="flex flex-wrap gap-2">
              {(stickers.data ?? []).map((sticker) => (
                <label key={sticker.id} className="flex items-center gap-2.5 rounded-full border border-admin-border px-3.5 py-2 text-[13.5px] text-admin-ink-soft">
                  <input type="checkbox" checked={stickerIds.includes(sticker.id)} onChange={() => onToggleSticker(sticker.id)} />
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: sticker.color }} aria-hidden="true" />
                  {sticker.label}
                </label>
              ))}
            </div>
          )}
      </fieldset>
    </>
  );
}

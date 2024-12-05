package file

type FileKind int

const (
	Unknown = iota
	Directory
	Word
	Excel
	PowerPoint
	PDF
	Video
	Image
	Zip
)

func (fileKind FileKind) ToJaString() string {
	switch fileKind {
	case Directory:
		return "ディレクトリ"
	case Word:
		return "Word文書"
	case Excel:
		return "Excel文書"
	case PowerPoint:
		return "PowerPoint文書"
	case PDF:
		return "PDF"
	case Video:
		return "動画"
	case Image:
		return "画像"
	case Zip:
		return "圧縮ファイル"
	default:
		return "不明"
	}
}

func (fileKind FileKind) ToEnString() string {
	switch fileKind {
	case Directory:
		return "Directory"
	case Word:
		return "WordDocument"
	case Excel:
		return "ExcelDocument"
	case PowerPoint:
		return "PowerPointDocument"
	case PDF:
		return "PDF"
	case Video:
		return "Video"
	case Image:
		return "Image"
	case Zip:
		return "CompressedFile"
	default:
		return "Unknown"
	}
}

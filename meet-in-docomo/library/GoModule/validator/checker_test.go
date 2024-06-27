package validator

import (
	"golang.org/x/net/context"
	"testing"
)

func TestCheckerTest(t *testing.T) {
	var (
		checker CellChecker
		ctx     = context.TODO()
	)

	// required
	checker = NewCellChecker("required")
	if checker == nil {
		t.Error("requiredチェッカーが生成できませんでした。")
	}
	if !checker(NewCell(ctx, "", 0)) {
		t.Error("requiredが正しくバリデーションできていません。")
	}
	if checker(NewCell(ctx, "test", 0)) {
		t.Error("requiredが正しくバリデーションできていません。")
	}

	// length
	checker = NewCellChecker("length")
	if checker != nil {
		t.Error("lengthチェッカーが不正な生成ができました。")
	}
	checker = NewCellChecker("length", 9)
	if checker == nil {
		t.Error("lengthチェッカーが生成できませんでした。")
	}
	if checker(NewCell(ctx, "八八八八八八八八", 0)) {
		t.Error("length")
	}
	if checker(NewCell(ctx, "九九九九九九九九九", 0)) {
		t.Error("length")
	}
	if !checker(NewCell(ctx, "十十十十十十十十十十", 0)) {
		t.Error("length")
	}

	// email
	checker = NewCellChecker("email")
	if checker == nil {
		t.Error("emailチェッカーが生成できませんでした。")
	}
	if checker(NewCell(ctx, "yamazaki@aidma-hd.jp", 0)) {
		t.Error("email")
	}
	if !checker(NewCell(ctx, "絶対に通らない", 0)) {
		t.Error("email")
	}

	// postcode
	checker = NewCellChecker("postcode")
	if checker == nil {
		t.Error("postcodeチェッカーが生成できませんでした。")
	}
	if checker(NewCell(ctx, "000-0000", 0)) {
		t.Error("postcode")
	}
	if checker(NewCell(ctx, "0000000", 0)) {
		t.Error("postcode")
	}
	if !checker(NewCell(ctx, "000 0000", 0)) {
		t.Error("postcode")
	}


	// url
	checker = NewCellChecker("url")
	if checker == nil {
		t.Error("urlチェッカーが生成できませんでした。")
	}
	if checker(NewCell(ctx, "https://google.co.jp", 0)) {
		t.Error("url")
	}
	if checker(NewCell(ctx, "aidma-hd.jp", 0)) {
		t.Error("url")
	}
	if !checker(NewCell(ctx, "000-0000", 0)) {
		t.Error("url")
	}


	// numeric
	checker = NewCellChecker("numeric")
	if checker == nil {
		t.Error("numericチェッカーが生成できませんでした。")
	}

	// alpha
	checker = NewCellChecker("alpha")
	if checker == nil {
		t.Error("alphaチェッカーが生成できませんでした。")
	}

	// alphaNumeric
	checker = NewCellChecker("alphaNumeric")
	if checker == nil {
		t.Error("alphaNumericチェッカーが生成できませんでした。")
	}

	// naturalNumeric
	checker = NewCellChecker("naturalNumeric")
	if checker == nil {
		t.Error("naturalNumericチェッカーが生成できませんでした。")
	}

	// webIp
	checker = NewCellChecker("webIp")
	if checker == nil {
		t.Error("webIpチェッカーが生成できませんでした。")
	}

	// telephone
	checker = NewCellChecker("telephone")
	if checker == nil {
		t.Error("telephoneチェッカーが生成できませんでした。")
	}
	t.Log("aaaa")
	if checker(NewCell(ctx, "08013083850", 0)) {
		t.Error("telephone")
	}
	if checker(NewCell(ctx, "080(1308)3850", 0)) {
		t.Error("telephone")
	}
	if checker(NewCell(ctx, "0120(117)117", 0)) {
		t.Error("telephone")
	}
	if checker(NewCell(ctx, "0120(117)117", 0)) {
		t.Error("telephone")
	}

	// color
	checker = NewCellChecker("color")
	if checker == nil {
		t.Error("colorチェッカーが生成できませんでした。")
	}
}

func BenchmarkNewCellChecker_required(b *testing.B) {
	for i := 0; b.N > i; i++ {
		_ = NewCellChecker("required")
	}
}

func BenchmarkNewCellChecker_color(b *testing.B) {
	for i := 0; b.N > i; i++ {
		_ = NewCellChecker("color")
	}
}

func BenchmarkNewCellChecker_lenght(b *testing.B) {
	for i := 0; b.N > i; i++ {
		_ = NewCellChecker("lenght", 1)
	}
}

func TestNewCrossChecker(t *testing.T) {
	crossChecker := NewCrossChecker(
		"concatLength",
		[]string{
			"data1",
			"data2",
		},
		[]string{
			"data1",
			"data2",
		},
		"error message",
		interface{}(10.0),
	)

	if crossChecker == nil {
		t.Error("CrossCheckerの作成に失敗しました。")
	}
}

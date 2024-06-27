package validator

import (
	"golang.org/x/net/context"
	"testing"
)

func TestNewCell(t *testing.T) {
	ctx := context.TODO()

	c := NewCell(ctx, "テスト\n", 0)
	if c.Length != 4 {
		t.Error("文字数が間違っています。")
	}
}

func BenchmarkNewCell(b *testing.B) {
	ctx := context.TODO()
	var c *Cell
	for i := 0; b.N > i; i++ {
		c = NewCell(ctx, "testdata", 0)
	}
	_ = len(c.Bytes())
}

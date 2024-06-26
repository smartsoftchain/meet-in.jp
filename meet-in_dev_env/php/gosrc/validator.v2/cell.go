package validator

import (
	"golang.org/x/net/context"
)

type Cell struct {
	buf     []byte
	Length  int
	Reports []string
}

func NewCell(ctx context.Context, value string, maxErrCount int) *Cell {
	return &Cell{
		buf:     []byte(value),
		Length:  len([]rune(value)),
		Reports: make([]string, 0, maxErrCount),
	}
}

func (c *Cell) Bytes() []byte {
	return c.buf
}
func (c *Cell) String() string {
	return string(c.buf)
}

func (c *Cell) report(msg string) {
	c.Reports = append(c.Reports, msg)
}

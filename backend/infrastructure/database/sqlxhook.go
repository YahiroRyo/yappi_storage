package database

import (
	"context"
	"fmt"
	"time"
)

type Hooks struct {
}

func (h *Hooks) Before(ctx context.Context, query string, args ...interface{}) (context.Context, error) {
	fmt.Printf("[sql] %s %q\n", query, args)
	return context.WithValue(ctx, "begin", time.Now()), nil
}

func (h *Hooks) After(ctx context.Context, query string, args ...interface{}) (context.Context, error) {
	begin := ctx.Value("begin").(time.Time)
	fmt.Printf("[sql] took: %s\n", time.Since(begin))
	return ctx, nil
}

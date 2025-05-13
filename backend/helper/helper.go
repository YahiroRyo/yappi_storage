package helper

import (
	"log"

	"github.com/bwmarrin/snowflake"
)

var snowflakeNode *snowflake.Node

func init() {
	var err error
	snowflakeNode, err = snowflake.NewNode(1)
	if err != nil {
		log.Fatalf("error initializing snowflake node: %v", err)
	}
}

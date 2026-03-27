using sys
using concurrent::Actor

** A comprehensive Fantom example
@Serializable
const class Config
{
  const Str name := "default"
  const Int port := 8080
  const Duration timeout := 30sec
}

enum class Status { active, inactive, pending }

mixin Displayable
{
  abstract Str display()
}

class Server : Displayable
{
  Config config
  Str? label

  new make(Config config)
  {
    this.config = config
  }

  override Str display() { return "Server: $config.name" }

  Void start()
  {
    // control flow
    if (config.port > 0)
    {
      echo("Starting on port ${config.port}")
    }
    else
    {
      throw Err("Invalid port")
    }

    // closures and it-blocks
    items := [1, 2, 3]
    items.each |Int v| { echo(v) }
    items.each { echo(it) }

    // operators
    x := config.port ?: 80
    r := 0..<10
    status := label != null ? label : "unknown"

    // type operations
    obj := this
    if (obj is Displayable) echo(obj)

    // maps and ranges
    headers := ["Content-Type":"text/html"]
    empty := [:]

    // durations
    t := 5sec + 100ms

    // type and slot literals
    type := Str#
    slot := Int#plus
  }
}

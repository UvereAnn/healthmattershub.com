# ─────────────────────────────────────────────
#  Networking Module
#
#  Creates:
#  - VPC (private network)
#  - 2 Public Subnets (for ALB)
#  - 2 Private Subnets (for Fargate)
#  - Internet Gateway (public internet access)
#  - NAT Gateway (private subnet internet access)
#  - Route Tables (traffic routing rules)
# ─────────────────────────────────────────────

# ── Variables ────────────────────────────────
variable "project_name" { type = string }
variable "environment"  { type = string }
variable "aws_region"   { type = string }

# ── Data Sources ─────────────────────────────
# Get list of available AZs in the region
data "aws_availability_zones" "available" {
  state = "available"
}

# ── VPC ──────────────────────────────────────
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# ── Public Subnets ───────────────────────────
# These host the ALB
# Traffic from internet comes in through here
resource "aws_subnet" "public" {
  count = 2

  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-${count.index + 1}"
    Type = "Public"
  }
}

# ── Private Subnets ──────────────────────────
# These host Fargate containers
# Not directly reachable from internet
resource "aws_subnet" "private" {
  count = 2

  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.project_name}-private-subnet-${count.index + 1}"
    Type = "Private"
  }
}

# ── Internet Gateway ─────────────────────────
# Connects VPC to internet
# Required for public subnets
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# ── Elastic IP for NAT Gateway ───────────────
# NAT Gateway needs a static public IP
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-nat-eip"
  }

  depends_on = [aws_internet_gateway.main]
}

# ── NAT Gateway ──────────────────────────────
# Allows private subnets to reach internet
# Sits in public subnet 1
# Private subnet traffic routes through here
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "${var.project_name}-nat-gateway"
  }

  depends_on = [aws_internet_gateway.main]
}

# ── Public Route Table ───────────────────────
# Routes outbound traffic to Internet Gateway
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

# ── Private Route Table ──────────────────────
# Routes outbound traffic to NAT Gateway
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-private-rt"
  }
}

# ── Route Table Associations ─────────────────
# Connect subnets to their route tables

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# ── Outputs ──────────────────────────────────
# Values passed to other modules
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "nat_gateway_ip" {
  description = "Whitelist this IP in MongoDB Atlas Network Access"
  value       = aws_eip.nat.public_ip
}